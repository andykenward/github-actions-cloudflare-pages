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
    '/** Every event name GitHub can set as `GITHUB_EVENT_NAME`. */',
    'export const EVENT_NAMES = [',
    ...[...eventNames].map(eventName => `"${eventName}",`),
    '] as const',
    'export type WebhookEventName = (typeof EVENT_NAMES)[number]'
  ].join('\n')
}

/**
 * Script to code generate the GitHub webhook event names from
 * [`@octokit/openapi-webhooks`](https://github.com/octokit/openapi-webhooks),
 * the replacement for the deprecated `@octokit/webhooks-schemas`. The payload
 * fields the action reads are a hand-written `Schema`
 * (`src/common/github/workflow-event/types.ts`), so the names are all that is
 * generated.
 */
const run = async () => {
  const source = buildEventNames(await readWebhooks())

  const DIRECTORY = '__generated__/types/github'
  if (!existsSync(DIRECTORY)) {
    await mkdir(DIRECTORY, {recursive: true})
  }
  const FILENAME = 'workflow-events.ts'

  await writeFile(`${DIRECTORY}/${FILENAME}`, source)

  process.stdout.write(`${DIRECTORY}/${FILENAME} written${'\n'}`)
}

void run()
