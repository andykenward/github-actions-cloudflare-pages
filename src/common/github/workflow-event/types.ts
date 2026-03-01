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
