import {strict as assert} from 'node:assert'
import {existsSync, readFileSync} from 'node:fs'
import {EOL} from 'node:os'

import {
  EVENT_NAMES,
  type EventName
} from '../../../__generated__/github/workflow-events.js'
import type {WorkflowEventExtract, WorkflowEventPayload} from './types.js'

/**
 * Loads the file from the runner that contains the full event webhook payload.
 */
const getPayload = (): unknown => {
  if (process.env.GITHUB_EVENT_PATH) {
    if (existsSync(process.env.GITHUB_EVENT_PATH)) {
      return JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, {encoding: 'utf8'})
      ) as unknown
    } else {
      const path = process.env.GITHUB_EVENT_PATH
      process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL}`)
    }
  }
}

export const getWorkflowEvent = () => {
  const eventName = process.env.GITHUB_EVENT_NAME as EventName

  assert(
    EVENT_NAMES.includes(eventName),
    `eventName ${eventName} is not supported`
  )
  /** Assume that the payload matches the eventName */
  const payload = getPayload() as WorkflowEventPayload<typeof eventName>

  return {
    eventName,
    payload
  } as Readonly<WorkflowEventExtract<typeof eventName>>
}
