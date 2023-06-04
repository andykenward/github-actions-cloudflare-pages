#!/usr/bin/env ts-node-transpile-only
/**
 * FORKED FROM
 * https://github.com/octokit/webhooks/blob/4147e7edafb8bcf8e6dd2dee4d3591d4ac52b338/bin/octokit-types.ts
 */
import {strict as assert} from 'node:assert'
import {writeFile} from 'node:fs/promises'
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
    'export type EventNames = (typeof EVENT_NAMES)[number]'
  ].join('\n')
}

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

const buildContext = (): string => {
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

  return [`export type Context = `, ...properties].join('')
}

const buildImport = (): string => {
  const properties = schema.oneOf.map(({$ref}) => {
    if (!$ref) return
    const eventName = getEventName($ref)
    const interfaceName = guessAtInterfaceName({$id: `${eventName}_event`})

    return [`${interfaceName}`, `,`].join('\n')
  })

  return [
    `import type {`,
    `WebhookEventName,`,
    ...properties,
    `}`,
    `from "@octokit/webhooks-types"`
  ].join('')
}

const run = async () => {
  const ts = [buildImport(), buildEventNames(), buildContext()].join('\n')

  const text = await prettier.resolveConfig(import.meta.url).then(options => {
    return prettier.format(ts, options || undefined)
  })

  await writeFile('src/github/generated/event-names.ts', text)
}

void run()
