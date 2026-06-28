import {strict as assert} from 'node:assert'
import {existsSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'

import openapiTS, {astToString} from 'openapi-typescript'

/**
 * Code generates TypeScript for the Cloudflare Pages REST endpoints this action
 * consumes, sourced from Cloudflare's canonical OpenAPI schema
 * ([`cloudflare/api-schemas`](https://github.com/cloudflare/api-schemas)).
 *
 * The published schema describes the *entire* Cloudflare API (~10MB), so this
 * script prunes it down to the handful of Pages operations we call, transitively
 * walking `$ref`s to keep only the referenced `components`, then hands the
 * self-contained subset to `openapi-typescript`. The result is a small, focused
 * `__generated__/types/cloudflare/pages.ts` instead of a multi-megabyte dump of
 * the whole API.
 *
 * There is no npm package for the schema, so it is fetched at codegen time (the
 * same network-at-codegen posture as [`bin/download/`](../download)). Pin a
 * specific revision with `CLOUDFLARE_API_SCHEMAS_REF` for reproducible regens.
 */

const REF = process.env['CLOUDFLARE_API_SCHEMAS_REF'] ?? 'main'
// Validate before interpolating into the URL: although the host is hardcoded,
// an unvalidated REF could smuggle path-traversal segments to reach a different
// repo/path (CodeQL SSRF). Restrict to characters valid in a git ref/path and
// reject `..` — note a plain charset regex still permits `../`, which git refs
// forbid anyway.
assert.ok(
  /^[a-zA-Z0-9._\-/]+$/u.test(REF) && !REF.includes('..'),
  `CLOUDFLARE_API_SCHEMAS_REF must be a valid git ref (got: ${JSON.stringify(REF)})`
)
const SCHEMA_URL = `https://raw.githubusercontent.com/cloudflare/api-schemas/${REF}/openapi.json`

/**
 * The Pages operations this action calls. Paths are matched by pattern (account
 * and project/deployment id segments are templated) so we are resilient to the
 * exact parameter names Cloudflare uses.
 */
const OPERATIONS: Array<{pattern: RegExp; methods: string[]}> = [
  // GET a single project — https://developers.cloudflare.com/api/resources/pages/subresources/projects/methods/get/
  {
    pattern: /^\/accounts\/\{[^}]+\}\/pages\/projects\/\{[^}]+\}$/u,
    methods: ['get']
  },
  // List + create deployments
  {
    pattern:
      /^\/accounts\/\{[^}]+\}\/pages\/projects\/\{[^}]+\}\/deployments$/u,
    methods: ['get', 'post']
  },
  // Get + delete a single deployment
  {
    pattern:
      /^\/accounts\/\{[^}]+\}\/pages\/projects\/\{[^}]+\}\/deployments\/\{[^}]+\}$/u,
    methods: ['get', 'delete']
  }
]

type Json = unknown
interface JsonObject {
  [key: string]: Json
}

const isObject = (value: Json): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/** Decode a single JSON Pointer reference token (`~1` → `/`, `~0` → `~`). */
const decodeToken = (token: string): string =>
  token.replaceAll('~1', '/').replaceAll('~0', '~')

/** Resolve a pointer like `components/schemas/Foo` against the root document. */
const resolvePointer = (root: JsonObject, pointer: string): Json => {
  let node: Json = root
  for (const rawToken of pointer.split('/')) {
    const token = decodeToken(rawToken)
    node = isObject(node) ? node[token] : undefined
  }
  return node
}

/** Set `value` at the (decoded) segment path under `root`, creating objects. */
const setAt = (root: JsonObject, pointer: string, value: Json): void => {
  const segments = pointer.split('/').map(token => decodeToken(token))
  let cursor = root
  for (const segment of segments.slice(0, -1)) {
    if (!isObject(cursor[segment])) cursor[segment] = {}
    cursor = cursor[segment] as JsonObject
  }
  cursor[segments.at(-1) as string] = value
}

const fetchSchema = async (): Promise<JsonObject> => {
  const response = await fetch(SCHEMA_URL)
  assert.ok(
    response.ok,
    `Failed to fetch Cloudflare OpenAPI schema (${response.status}) from ${SCHEMA_URL}`
  )
  const schema: Json = await response.json()
  assert.ok(isObject(schema), 'Cloudflare OpenAPI schema is not an object')
  assert.ok(isObject(schema['paths']), 'Cloudflare OpenAPI schema has no paths')
  return schema
}

/** Keep only whitelisted operations (and shared path-level params) per path. */
const prunePaths = (paths: JsonObject): JsonObject => {
  const pruned: JsonObject = {}
  for (const [pathKey, pathItem] of Object.entries(paths)) {
    const rule = OPERATIONS.find(({pattern}) => pattern.test(pathKey))
    if (!rule || !isObject(pathItem)) continue

    const kept: JsonObject = {}
    if (pathItem['parameters']) kept['parameters'] = pathItem['parameters']
    for (const method of rule.methods) {
      if (pathItem[method]) kept[method] = pathItem[method]
    }
    if (Object.keys(kept).length > 0) pruned[pathKey] = kept
  }
  assert.ok(
    Object.keys(pruned).length > 0,
    'No Pages operations matched — the schema path shape may have changed'
  )
  return pruned
}

/** Transitively collect every `#/components/...` pointer reachable from `node`. */
const collectRefs = (root: JsonObject, node: Json, used: Set<string>): void => {
  if (Array.isArray(node)) {
    for (const item of node) collectRefs(root, item, used)
    return
  }
  if (!isObject(node)) return

  for (const [key, value] of Object.entries(node)) {
    if (
      key === '$ref' &&
      typeof value === 'string' &&
      value.startsWith('#/components/')
    ) {
      const pointer = value.slice('#/'.length)
      if (!used.has(pointer)) {
        used.add(pointer)
        collectRefs(root, resolvePointer(root, pointer), used)
      }
    } else {
      collectRefs(root, value, used)
    }
  }
}

const run = async (): Promise<void> => {
  const schema = await fetchSchema()
  const paths = prunePaths(schema['paths'] as JsonObject)

  const used = new Set<string>()
  collectRefs(schema, paths, used)

  const subset: JsonObject = {
    openapi: schema['openapi'] ?? '3.0.0',
    info: schema['info'] ?? {title: 'Cloudflare Pages', version: 'generated'},
    paths,
    components: {}
  }
  for (const pointer of used) {
    setAt(subset, pointer, resolvePointer(schema, pointer))
  }

  const ast = await openapiTS(
    subset as unknown as Parameters<typeof openapiTS>[0]
  )
  const banner =
    '/* Generated by `pnpm run codegen:cloudflare`. Do not edit. */\n' +
    `/* Source: cloudflare/api-schemas @ ${REF} */\n`
  const contents = `${banner}${astToString(ast)}`

  const DIR = '__generated__/types/cloudflare'
  if (!existsSync(DIR)) await mkdir(DIR, {recursive: true})
  const FILENAME = 'pages.ts'

  await writeFile(`${DIR}/${FILENAME}`, contents)
  process.stdout.write(
    `${DIR}/${FILENAME} written (${used.size} components, ${Object.keys(paths).length} paths)\n`
  )
}

void run()
