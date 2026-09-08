import {strict as assert} from 'node:assert'
import {existsSync} from 'node:fs'
import {mkdir, readFile, writeFile} from 'node:fs/promises'
import {fileURLToPath} from 'node:url'

/**
 * Only the slice of the OpenAPI document this script reads. The spec is parsed
 * at runtime rather than imported as JSON so `tsc` never has to type the ~5MB
 * document.
 */
interface WebhooksOpenApi {
  webhooks: Record<string, {post: {operationId: string}}>
}

const SPECIFIER = '@octokit/openapi-webhooks/generated/api.github.com.json'

const readWebhooks = async (): Promise<WebhooksOpenApi['webhooks']> => {
  const spec = JSON.parse(
    await readFile(fileURLToPath(import.meta.resolve(SPECIFIER)), 'utf8')
  ) as WebhooksOpenApi

  assert.ok(spec.webhooks, `no webhooks found in ${SPECIFIER}`)

  return spec.webhooks
}

/**
 * A webhook operation id is `<event>/<action>`, or just `<event>` for events
 * that have no action. The `<event>` segment is the kebab-case form of the
 * `GITHUB_EVENT_NAME` a workflow receives, e.g. `workflow-run/completed` is
 * delivered to a workflow as `workflow_run`.
 */
const getEventName = (operationId: string): string => {
  const [event] = operationId.split('/')

  assert.ok(event, `unable to find an event name from ${operationId}`)

  return event.replaceAll('-', '_')
}

/**
 * Every distinct `GITHUB_EVENT_NAME` in the OpenAPI document, in the order the
 * webhooks appear.
 */
const buildEventNames = (webhooks: WebhooksOpenApi['webhooks']): string => {
  const eventNames = new Set<string>()

  for (const [key, {post}] of Object.entries(webhooks)) {
    assert.ok(post.operationId, `${key} has no operationId`)

    eventNames.add(getEventName(post.operationId))
  }

  assert.ok(eventNames.size > 0, 'no event names found')

  return [
    '/**',
    ' * Every event name GitHub can set as `GITHUB_EVENT_NAME`, as a runtime',
    ' * value. This is the one thing that cannot be derived from',
    ' * `@octokit/openapi-webhooks-types`, which is types only.',
    ' */',
    'export const EVENT_NAMES = [',
    ...[...eventNames].map(eventName => `"${eventName}",`),
    '] satisfies Array<WebhookEventName>',
    'export type EventName = (typeof EVENT_NAMES)[number]'
  ].join('\n')
}

/**
 * The type half of the module. Nothing here depends on the OpenAPI document —
 * it is derived from `@octokit/openapi-webhooks-types` — but it is emitted
 * alongside `EVENT_NAMES` so the whole module has one home.
 */
const TYPES = `import type {operations} from "@octokit/openapi-webhooks-types"

type SnakeCase<S extends string> = S extends \`\${infer Head}-\${infer Tail}\`
? \`\${Head}_\${SnakeCase<Tail>}\`
: S

type OperationId = keyof operations & string

/**
 * A webhook operation id is \`<event>/<action>\`, or just \`<event>\` for events
 * that have no action.
 */
type OperationEventName<O extends string> = O extends \`\${infer Event}/\${string}\`
? Event
: O

/** Every event name GitHub can set as \`GITHUB_EVENT_NAME\`. */
export type WebhookEventName = SnakeCase<OperationEventName<OperationId>>

/** The union of JSON bodies GitHub delivers for one event name. */
type WebhookPayload<E extends WebhookEventName> = {
[O in OperationId]: SnakeCase<OperationEventName<O>> extends E
? operations[O]["requestBody"]["content"]["application/json"]
: never
}[OperationId]

export interface WorkflowEventBase {
eventName: WebhookEventName
payload: WebhookPayload<WebhookEventName>
}

/**
 * Discriminated union of every workflow event, pairing each \`GITHUB_EVENT_NAME\`
 * with the payloads GitHub delivers under it.
 */
export type WorkflowEvent = {
[E in WebhookEventName]: {eventName: E; payload: WebhookPayload<E>}
}[WebhookEventName]`

/**
 * Script to code generate GitHub webhook event types from
 * [`@octokit/openapi-webhooks`](https://github.com/octokit/openapi-webhooks),
 * the replacement for the deprecated `@octokit/webhooks-schemas`.
 *
 * The payload types come straight from
 * [`@octokit/openapi-webhooks-types`](https://github.com/octokit/openapi-webhooks/tree/main/packages/openapi-webhooks-types);
 * only `EVENT_NAMES` has to be generated, because that package is types only
 * and the event names are needed at runtime.
 */
const run = async () => {
  const ts = [TYPES, buildEventNames(await readWebhooks())].join('\n')

  const DIR = '__generated__/types/github'
  if (!existsSync(DIR)) {
    await mkdir(DIR, {recursive: true})
  }
  const FILENAME = 'workflow-events.ts'

  await writeFile(`${DIR}/${FILENAME}`, ts)

  process.stdout.write(`${DIR}/${FILENAME} written${'\n'}`)
}

void run()
