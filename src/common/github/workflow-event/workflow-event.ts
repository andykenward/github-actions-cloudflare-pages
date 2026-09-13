import assert from 'node:assert/strict'
import {existsSync, readFileSync} from 'node:fs'

import {debug, isDebug} from '@actions/core'
import * as Result from 'effect/Result'
import * as Schema from 'effect/Schema'

import {parseJson} from '@/common/json.js'
import {EVENT_NAMES} from '@/types/github/workflow-events.js'

import {WorkflowEvent} from './types.js'

const isEventName = Schema.is(Schema.Literals(EVENT_NAMES))

const decodeEvent = Schema.decodeUnknownResult(WorkflowEvent)

/**
 * Loads the file from the runner that contains the full event webhook payload.
 * Only the JSON parse is guarded here, so a truncated or malformed file
 * reports itself rather than surfacing as an opaque `SyntaxError`; the shape
 * is checked by `getWorkflowEvent`.
 */
const readEventPayloadFile = (): {path: string; payload: unknown} => {
  const path = process.env.GITHUB_EVENT_PATH

  // The runner always writes the file. Without it every later payload read
  // would fail with an opaque `TypeError`, so name the problem here.
  if (!path) {
    throw new Error('GITHUB_EVENT_PATH is not set')
  }

  if (!existsSync(path)) {
    throw new Error(`GITHUB_EVENT_PATH ${path} does not exist`)
  }

  const payload = parseJson(readFileSync(path, {encoding: 'utf8'}))

  if (payload === undefined) {
    throw new Error(`GITHUB_EVENT_PATH ${path} is not valid JSON`)
  }

  return {path, payload}
}

/**
 * The event that triggered the run, decoded with `WorkflowEvent`: an unknown
 * `GITHUB_EVENT_NAME`, or a payload without a field the action reads for that
 * event, throws naming it.
 */
export const getWorkflowEvent = (): WorkflowEvent => {
  const eventName = process.env.GITHUB_EVENT_NAME

  if (!isEventName(eventName)) {
    throw new Error(`eventName ${eventName} is not supported`)
  }

  const {path, payload} = readEventPayloadFile()

  const event = decodeEvent({eventName, payload})

  if (Result.isFailure(event)) {
    throw new Error(
      `GITHUB_EVENT_PATH ${path} is not a ${eventName} payload: ${event.failure.message}`
    )
  }

  assert.equal(event.success.eventName, eventName)

  if (isDebug()) {
    debug(`eventName: ${eventName}`)
    debug(`payload: ${JSON.stringify(event.success.payload)}`)
  }

  return event.success
}
