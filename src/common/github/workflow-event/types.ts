import * as Schema from 'effect/Schema'

import {EVENT_NAMES} from '@/types/github/workflow-events.js'

/**
 * The parts of a webhook payload the action reads, by event. Everything else
 * in the file GitHub writes to `GITHUB_EVENT_PATH` is ignored, so the schema
 * stays small and a payload missing a field the action needs fails when the
 * context is built, naming the field.
 */

/** Fields any event may carry. */
const base = {
  /** The repository the run is in; its `node_id` is the GraphQL id. */
  repository: Schema.optional(Schema.Struct({node_id: Schema.String})),
  /** The fully-formed ref, e.g. `refs/heads/main`, on `push` and a few others. */
  ref: Schema.optional(Schema.NullOr(Schema.String))
}

const PullRequestEvent = Schema.Struct({
  eventName: Schema.Literal('pull_request'),
  payload: Schema.Struct({
    ...base,
    action: Schema.String,
    pull_request: Schema.Struct({
      node_id: Schema.String,
      head: Schema.Struct({ref: Schema.String})
    })
  })
})

const WorkflowRunEvent = Schema.Struct({
  eventName: Schema.Literal('workflow_run'),
  payload: Schema.Struct({
    ...base,
    workflow_run: Schema.Struct({
      head_branch: Schema.NullOr(Schema.String),
      head_sha: Schema.String,
      /** Empty for a pull request from a fork. */
      pull_requests: Schema.Array(
        Schema.NullOr(
          Schema.Struct({
            number: Schema.Number,
            head: Schema.Struct({ref: Schema.String, sha: Schema.String})
          })
        )
      )
    })
  })
})

const SPECIFIC_EVENT_NAMES = ['pull_request', 'workflow_run'] as const

type OtherEventName = Exclude<
  (typeof EVENT_NAMES)[number],
  (typeof SPECIFIC_EVENT_NAMES)[number]
>

const OTHER_EVENT_NAMES = EVENT_NAMES.filter(
  (eventName): eventName is OtherEventName =>
    !(SPECIFIC_EVENT_NAMES as ReadonlyArray<string>).includes(eventName)
)

/** Every other event GitHub can deliver; only the base fields are read. */
const OtherEvent = Schema.Struct({
  eventName: Schema.Literals(OTHER_EVENT_NAMES),
  payload: Schema.Struct(base)
})

/**
 * A workflow's triggering event: `GITHUB_EVENT_NAME` paired with the fields
 * of its payload the action reads. Discriminated on `eventName`.
 */
export const WorkflowEvent = Schema.Union([
  PullRequestEvent,
  WorkflowRunEvent,
  OtherEvent
])

export type WorkflowEvent = typeof WorkflowEvent.Type
