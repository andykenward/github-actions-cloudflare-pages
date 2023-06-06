#!/usr/bin/env ts-node-transpile-only
import {strict as assert} from 'node:assert'
import {existsSync} from 'node:fs'
import {mkdir, writeFile} from 'node:fs/promises'
import {createRequire} from 'node:module'

import type {JSONSchema7} from 'json-schema'
import prettier from 'prettier'

const require = createRequire(import.meta.url)

interface Schema extends JSONSchema7 {
  oneOf: Array<JSONSchema7 & Required<Pick<JSONSchema7, '$ref'>>>
}
/**
 * assert {type: 'json'} isn't supported by some tooling
 */
// import schema from '@octokit/webhooks-schemas/schema.json' assert {type: 'json'}
const schema = require('@octokit/webhooks-schemas') as Schema

export const capitalize = (str: string) => {
  assert.ok(str.length > 0 && str[0], 'unable to capitalize string')

  return `${str[0].toUpperCase()}${str.slice(1)}`
}

export const guessAtInterfaceName = (schema: JSONSchema7): string => {
  const str = schema.title || schema.$id

  assert.ok(str, 'unable to guess interface name')

  return str
    .split(/[$_ -]/u)
    .map(element => capitalize(element))
    .join('')
}

const getEventName = (ref: string): string => {
  assert.ok(
    ref.startsWith('#/definitions/'),
    `${ref} does not point to definitions`
  )

  assert.ok(
    ref.endsWith('event'),
    `${ref} does not point to an event definition`
  )

  const [, eventName] = /^#\/definitions\/(.+)[$_]event$/u.exec(ref) ?? []

  assert.ok(eventName, `unable to find an event name from ${ref}`)

  return eventName
}

const buildEventNames = (): string => {
  const properties = schema.oneOf.map(({$ref}) => {
    if (!$ref) return
    const eventName = getEventName($ref)

    return `"${eventName}",`
  })

  return [
    'export const EVENT_NAMES = [',
    ...properties,
    '] satisfies Array<WebhookEventName>',
    'export type EventName = (typeof EVENT_NAMES)[number]'
  ].join('\n')
}

const buildWorkflowBase = (): string => {
  return [
    `export interface WorkflowEventBase {`,
    `eventName: WebhookEventName`,
    `payload: Schema`,
    `}`
  ].join(`\n`)
}

const buildWorkflowEvent = (): string => {
  const properties = schema.oneOf.map(({$ref}) => {
    if (!$ref) return
    const eventName = getEventName($ref)
    const interfaceName = guessAtInterfaceName({$id: `${eventName}_event`})

    return [
      `|`,
      `{`,
      `eventName: "${eventName}"`,
      `payload: ${interfaceName}`,
      `}`
    ].join('\n')
  })

  return [`export type WorkflowEvent = `, ...properties].join('')
}

const buildImports = (): string => {
  const properties = schema.oneOf.map(({$ref}) => {
    if (!$ref) return
    const eventName = getEventName($ref)
    const interfaceName = guessAtInterfaceName({$id: `${eventName}_event`})

    return [`${interfaceName}`, `,`].join('\n')
  })

  return [
    `import type {`,
    `Schema,`,
    `WebhookEventName,`,
    ...properties,
    `}`,
    `from "@octokit/webhooks-types"`
  ].join('')
}

/**
 * Script to code generate GitHub webhook event types from [`@octokit/webhooks-schemas`](https://github.com/octokit/webhooks)
 * Matching the [`WebhookEventName`](https://github.com/octokit/webhooks/blob/a5c455c39903cfc033d4c7a0ee0dc6476aa60a2d/payload-types/schema.d.ts#L8324)
 * to a [`Schema`](https://github.com/octokit/webhooks/blob/a5c455c39903cfc033d4c7a0ee0dc6476aa60a2d/payload-types/schema.d.ts#L8-L70)
 *
 * Forked from [`octokit/webhooks/bin/octokit-types.ts`](https://github.com/octokit/webhooks/blob/4147e7edafb8bcf8e6dd2dee4d3591d4ac52b338/bin/octokit-types.ts)
 */
const run = async () => {
  const ts = [
    buildImports(),
    buildEventNames(),
    buildWorkflowBase(),
    buildWorkflowEvent()
  ].join('\n')

  const text = await prettier.resolveConfig(import.meta.url).then(options => {
    return prettier.format(ts, options || undefined)
  })
  const DIR = '__generated__/types/github'
  if (!existsSync(DIR)) {
    await mkdir(DIR, {recursive: true})
  }
  const FILENAME = 'workflow-events.ts'

  await writeFile(`${DIR}/${FILENAME}`, text)

  process.stdout.write(`${DIR}/${FILENAME} written${'\n'}`)
}

void run()
