import type {operations} from '@octokit/openapi-webhooks-types'

type SnakeCase<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}_${SnakeCase<Tail>}`
  : S

type OperationId = keyof operations & string

/**
 * A webhook operation id is `<event>/<action>`, or just `<event>` for events
 * that have no action.
 */
type OperationEventName<O extends string> = O extends `${infer Event}/${string}`
  ? Event
  : O

/** Every event name GitHub can set as `GITHUB_EVENT_NAME`. */
export type WebhookEventName = SnakeCase<OperationEventName<OperationId>>

/** The union of JSON bodies GitHub delivers for one event name. */
type WebhookPayload<E extends WebhookEventName> = {
  [O in OperationId]: SnakeCase<OperationEventName<O>> extends E
    ? operations[O]['requestBody']['content']['application/json']
    : never
}[OperationId]

export interface WorkflowEventBase {
  eventName: WebhookEventName
  payload: WebhookPayload<WebhookEventName>
}

/**
 * Discriminated union of every workflow event, pairing each `GITHUB_EVENT_NAME`
 * with the payloads GitHub delivers under it.
 */
export type WorkflowEvent = {
  [E in WebhookEventName]: {eventName: E; payload: WebhookPayload<E>}
}[WebhookEventName]
/**
 * Every event name GitHub can set as `GITHUB_EVENT_NAME`, as a runtime
 * value. This is the one thing that cannot be derived from
 * `@octokit/openapi-webhooks-types`, which is types only.
 */
export const EVENT_NAMES = [
  'branch_protection_configuration',
  'branch_protection_rule',
  'check_run',
  'check_suite',
  'code_scanning_alert',
  'commit_comment',
  'create',
  'custom_property',
  'custom_property_values',
  'delete',
  'dependabot_alert',
  'deploy_key',
  'deployment',
  'deployment_protection_rule',
  'deployment_review',
  'deployment_status',
  'discussion',
  'discussion_comment',
  'fork',
  'github_app_authorization',
  'gollum',
  'installation',
  'installation_repositories',
  'installation_target',
  'issue_comment',
  'issue_dependencies',
  'issues',
  'label',
  'marketplace_purchase',
  'member',
  'membership',
  'merge_group',
  'meta',
  'milestone',
  'org_block',
  'organization',
  'package',
  'page_build',
  'personal_access_token_request',
  'ping',
  'project_card',
  'project',
  'project_column',
  'projects_v2',
  'projects_v2_item',
  'projects_v2_status_update',
  'public',
  'pull_request',
  'pull_request_review_comment',
  'pull_request_review',
  'pull_request_review_thread',
  'push',
  'registry_package',
  'release',
  'repository_advisory',
  'repository',
  'repository_dispatch',
  'repository_import',
  'repository_ruleset',
  'repository_vulnerability_alert',
  'secret_scanning_alert',
  'secret_scanning_alert_location',
  'secret_scanning_scan',
  'security_advisory',
  'security_and_analysis',
  'sponsorship',
  'star',
  'status',
  'sub_issues',
  'team_add',
  'team',
  'watch',
  'workflow_dispatch',
  'workflow_job',
  'workflow_run'
] satisfies Array<WebhookEventName>
export type EventName = (typeof EVENT_NAMES)[number]
