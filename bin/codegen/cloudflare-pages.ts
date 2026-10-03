import type {OpenAPISpec} from 'effect/http-api/OpenApi'
import type * as Schema from 'effect/Schema'

import {strict as assert} from 'node:assert'
import {existsSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'

import * as OpenApiGenerator from '@effect/openapi-generator/OpenApiGenerator'
import * as OpenApiPatch from '@effect/openapi-generator/OpenApiPatch'
import * as Effect from 'effect/Effect'

/**
 * Code generates the typed client for the Cloudflare Pages REST endpoints this
 * action consumes, sourced from Cloudflare's canonical OpenAPI schema
 * ([`cloudflare/api-schemas`](https://github.com/cloudflare/api-schemas)).
 *
 * The published schema describes the *entire* Cloudflare API (~10MB), so this
 * script prunes it down to the handful of Pages operations we call, transitively
 * walking `$ref`s to keep only the referenced `components`, then hands the
 * self-contained subset to `@effect/openapi-generator`. The result is a small,
 * focused `__generated__/types/cloudflare/pages.ts` — the response types and
 * an `effect/http` client with one method per operation — instead of a
 * multi-megabyte dump of the whole API.
 *
 * The client is generated type-only (`httpclient-type-only`): it casts a
 * response body to its type rather than decoding it with a `Schema`, because
 * Cloudflare's real responses don't always match its schema (an `ad_hoc`
 * deployment has `source: null`) and a strict decode would reject them.
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
 * The Pages operations this action calls — only those: each one is a method
 * of the generated client, so an unused operation is dead code in `dist/`.
 * Paths are matched by pattern (account and project/deployment id segments are
 * templated) so we are resilient to the exact parameter names Cloudflare uses.
 */
const OPERATIONS: Array<{pattern: RegExp; methods: string[]}> = [
  // List deployments — creating one is wrangler's job
  {
    pattern:
      /^\/accounts\/\{[^}]+\}\/pages\/projects\/\{[^}]+\}\/deployments$/u,
    methods: ['get']
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
    if (!isObject(cursor[segment])) {
      cursor[segment] = {}
    }
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
    if (!rule || !isObject(pathItem)) {
      continue
    }

    const kept: JsonObject = {}
    if (pathItem['parameters']) {
      kept['parameters'] = pathItem['parameters']
    }
    for (const method of rule.methods) {
      if (pathItem[method]) {
        kept[method] = pathItem[method]
      }
    }
    if (Object.keys(kept).length > 0) {
      pruned[pathKey] = kept
    }
  }
  assert.ok(
    Object.keys(pruned).length > 0,
    'No Pages operations matched — the schema path shape may have changed'
  )
  return pruned
}

/** Cloudflare's whole schema is far smaller; the bound catches a `$ref` cycle the `used` set missed. */
const NODE_COUNT_MAX = 10_000_000

/** A value still to walk, or a pointer still to resolve, in visit order. */
type Frame = {node: Json} | {pointer: string}

/** The frames for `node`'s children, in reverse so the first is popped first. */
const childFrames = (node: Json): Array<Frame> => {
  if (Array.isArray(node)) {
    return node.map(item => ({node: item})).toReversed()
  }
  if (!isObject(node)) {
    return []
  }
  return Object.entries(node)
    .map(([key, value]): Frame =>
      key === '$ref' &&
      typeof value === 'string' &&
      value.startsWith('#/components/')
        ? {pointer: value.slice('#/'.length)}
        : {node: value}
    )
    .toReversed()
}

/**
 * Transitively collect every `#/components/...` pointer reachable from `node`,
 * in depth-first visit order (the order `used` is written out in).
 */
const collectRefs = (root: JsonObject, node: Json, used: Set<string>): void => {
  const stack: Array<Frame> = [{node}]
  for (let visited = 0; stack.length > 0; visited++) {
    assert.ok(visited < NODE_COUNT_MAX, `More than ${NODE_COUNT_MAX} nodes`)
    const frame = stack.pop()
    if (frame === undefined) {
      break
    }
    if ('pointer' in frame) {
      if (!used.has(frame.pointer)) {
        used.add(frame.pointer)
        stack.push({node: resolvePointer(root, frame.pointer)})
      }
      continue
    }
    stack.push(...childFrames(frame.node))
  }
}

/**
 * Corrections to the pruned schema, applied in order before generation
 * ([RFC 6902](https://www.rfc-editor.org/rfc/rfc6902) operations, as the
 * generator's own `--patch` flag takes). A path that no longer exists fails
 * the run, so a patch Cloudflare has made unnecessary can't linger unnoticed.
 */
const PATCHES: OpenApiPatch.JsonPatchDocument = [
  // The generator can't intersect `type: object` with a `oneOf` ("Cannot
  // intersect these anyOf or oneOf alternatives"); the members already say
  // they are objects.
  {
    op: 'remove',
    path: '/components/schemas/pages_env_vars/additionalProperties/type'
  },
  // Cloudflare sends `source: null` for an `ad_hoc` (wrangler) deployment,
  // which is every deployment this action creates (checked live 2026-09-11).
  {
    op: 'replace',
    path: '/components/schemas/pages_deployment/properties/source',
    value: {
      anyOf: [{$ref: '#/components/schemas/pages_source'}, {type: 'null'}]
    }
  }
]

/** The generator's warnings fail the run: each is something it left out. */
const generate = (subset: JsonObject): Promise<string> => {
  const warnings: Array<string> = []
  return Effect.runPromise(
    Effect.gen(function* () {
      const patched = yield* OpenApiPatch.applyPatches(
        [{source: 'PATCHES', patch: PATCHES}],
        // Parsed from JSON by `fetchSchema`, so it holds only JSON values.
        subset as Schema.Json
      )
      const generator = yield* OpenApiGenerator.OpenApiGenerator
      // The subset was checked to be an object with `paths`; the generator
      // validates the rest of the document itself.
      const source = yield* generator.generate(
        patched as unknown as OpenAPISpec,
        {
          name: 'CloudflarePages',
          format: 'httpclient-type-only',
          onWarning: warning => {
            warnings.push(`[${warning.code}] ${warning.message}`)
          }
        }
      )
      assert.deepEqual(warnings, [], 'The generator reported warnings')
      return source
    }).pipe(
      // This script is the entry point.
      // oxlint-disable-next-line effecttsgo/strict-effect-provide
      Effect.provide(OpenApiGenerator.layerTransformerTs)
    )
  )
}

const SCHEMA_IMPORT = 'import type * as Schema from "effect/Schema"'

/**
 * The type-only output names `Schema.Json` (the type of an object's unlisted
 * properties) without importing `Schema`, so it doesn't type-check as
 * generated (@effect/openapi-generator 4.0.0). Remove this once it does.
 *
 * Closing the objects instead (`additionalProperties: false` through the
 * generator's `onEnter` hook) is not an option: Cloudflare composes every
 * response with `allOf`, and two closed objects intersect to `never`.
 */
const withSchemaImport = (source: string): string => {
  assert.ok(source.includes('Schema.Json'), 'Schema.Json is no longer used')
  assert.ok(
    !/^import .* as Schema from/mu.test(source),
    'The generator now imports Schema itself: remove withSchemaImport'
  )
  return `${SCHEMA_IMPORT}\n${source}`
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

  const banner =
    '/* Generated by `pnpm run codegen:cloudflare`. Do not edit. */\n' +
    `/* Source: cloudflare/api-schemas @ ${REF} */\n\n`
  const contents = `${banner}${withSchemaImport(await generate(subset))}\n`

  const DIRECTORY = '__generated__/types/cloudflare'
  if (!existsSync(DIRECTORY)) {
    await mkdir(DIRECTORY, {recursive: true})
  }
  const FILENAME = 'pages.ts'

  await writeFile(`${DIRECTORY}/${FILENAME}`, contents)
  process.stdout.write(
    `${DIRECTORY}/${FILENAME} written (${used.size} components, ${Object.keys(paths).length} paths)\n`
  )
}

void run()
