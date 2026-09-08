import {existsSync, readFileSync} from 'node:fs'
import {EOL} from 'node:os'

import {debug, isDebug} from '@actions/core'
import * as Option from 'effect/Option'
import * as Result from 'effect/Result'
import * as Schema from 'effect/Schema'

import {EVENT_NAMES} from '@/types/github/workflow-events.js'

import type {WorkflowEventExtract, WorkflowEventPayload} from './types.js'

const EventNameSchema = Schema.Literals(EVENT_NAMES)

const decodeEventName = Schema.decodeUnknownResult(EventNameSchema)

const decodeJson = Schema.decodeUnknownResult(
  Schema.fromJsonString(Schema.Unknown)
)

/**
 * Loads the file from the runner that contains the full event webhook payload.
 *
 * The payload is *not* schema-validated: its shape is the union of every
 * generated webhook type, which is far too large to restate by hand. Only the
 * JSON parse is guarded, so a truncated or malformed file reports itself rather
 * than surfacing as an opaque `SyntaxError`.
 */
const getPayload = (): unknown => {
  const path = process.env.GITHUB_EVENT_PATH

  if (!path) return

  if (!existsSync(path)) {
    process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL}`)
    return
  }

  const contents = readFileSync(path, {encoding: 'utf8'})
  const parsed = Option.getOrUndefined(Result.getSuccess(decodeJson(contents)))

  if (parsed === undefined) {
    throw new Error(`GITHUB_EVENT_PATH ${path} is not valid JSON`)
  }

  return parsed
}

export const getWorkflowEvent = () => {
  const eventName = Option.getOrUndefined(
    Result.getSuccess(decodeEventName(process.env.GITHUB_EVENT_NAME))
  )

  if (eventName === undefined) {
    throw new Error(
      `eventName ${process.env.GITHUB_EVENT_NAME} is not supported`
    )
  }

  /** Assume that the payload matches the eventName */
  const payload = getPayload() as WorkflowEventPayload<typeof eventName>

  if (isDebug()) {
    debug(`eventName: ${eventName}`)
    debug(`payload: ${JSON.stringify(payload)}`)
  }

  return {
    eventName,
    payload
  } as Readonly<WorkflowEventExtract<typeof eventName>>
}
