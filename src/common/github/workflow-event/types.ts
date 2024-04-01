import type {EventName, WorkflowEvent} from '@/types/github/workflow-events.js'

/**
 * Extracts a workflow event from the WorkflowEvent Union using the eventName property.
 *
 * Example:
 * ```ts
 * type PullRequestEvent = WorkflowEventExtract<'pull_request'>
 *
 * type PullRequestEvent = {
 *   eventName: 'pull_request';
 *   payload: PullRequestEvent;
 * }
 * ```
 */
export type WorkflowEventExtract<E extends EventName> = Extract<
  WorkflowEvent,
  {eventName: E}
>

/**
 * Extracts a workflow event payload from the WorkflowEvent Union using the
 * eventName property.
 *
 * Example:
 * ```ts
 * type PullRequestEventPayload = WorkflowEventPayload<'pull_request'>
 *
 * type PullRequestEvent = PullRequestAssignedEvent |
 * PullRequestAutoMergeDisabledEvent | PullRequestAutoMergeEnabledEvent
 * | ... 17 more ... | PullRequestUnlockedEvent
 * ```
 */
export type WorkflowEventPayload<E extends EventName> = Extract<
  WorkflowEvent,
  {eventName: E}
>['payload']

/**
 * Extracts a workflow event payload from the WorkflowEvent Union using the
 * eventName property & the payload action property.
 *
 * Example:
 * ```ts
 * type PullRequestAssigned = WorkflowEventPayloadAction<
 *   'pull_request',
 *   'assigned'
 * >
 *
 * type PullRequestAssigned = PullRequestAssignedEvent
 * ```
 */
export type WorkflowEventPayloadAction<
  E extends EventName,
  A extends string
> = Extract<Extract<WorkflowEvent, {eventName: E}>['payload'], {action: A}>
