import type {
  BranchProtectionRuleEvent,
  CheckRunEvent,
  CheckSuiteEvent,
  CodeScanningAlertEvent,
  CommitCommentEvent,
  CreateEvent,
  DeleteEvent,
  DependabotAlertEvent,
  DeployKeyEvent,
  DeploymentEvent,
  DeploymentProtectionRuleEvent,
  DeploymentReviewEvent,
  DeploymentStatusEvent,
  DiscussionCommentEvent,
  DiscussionEvent,
  ForkEvent,
  GithubAppAuthorizationEvent,
  GollumEvent,
  InstallationEvent,
  InstallationRepositoriesEvent,
  InstallationTargetEvent,
  IssueCommentEvent,
  IssuesEvent,
  LabelEvent,
  MarketplacePurchaseEvent,
  MemberEvent,
  MembershipEvent,
  MergeGroupEvent,
  MetaEvent,
  MilestoneEvent,
  OrganizationEvent,
  OrgBlockEvent,
  PackageEvent,
  PageBuildEvent,
  PingEvent,
  ProjectCardEvent,
  ProjectColumnEvent,
  ProjectEvent,
  ProjectsV2ItemEvent,
  PublicEvent,
  PullRequestEvent,
  PullRequestReviewCommentEvent,
  PullRequestReviewEvent,
  PullRequestReviewThreadEvent,
  PushEvent,
  RegistryPackageEvent,
  ReleaseEvent,
  RepositoryDispatchEvent,
  RepositoryEvent,
  RepositoryImportEvent,
  RepositoryVulnerabilityAlertEvent,
  Schema,
  SecretScanningAlertEvent,
  SecretScanningAlertLocationEvent,
  SecurityAdvisoryEvent,
  SponsorshipEvent,
  StarEvent,
  StatusEvent,
  TeamAddEvent,
  TeamEvent,
  WatchEvent,
  WebhookEventName,
  WorkflowDispatchEvent,
  WorkflowJobEvent,
  WorkflowRunEvent
} from '@octokit/webhooks-types'

export const EVENT_NAMES = [
  'branch_protection_rule',
  'check_run',
  'check_suite',
  'code_scanning_alert',
  'commit_comment',
  'create',
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
  'ping',
  'project',
  'project_card',
  'project_column',
  'projects_v2_item',
  'public',
  'pull_request',
  'pull_request_review',
  'pull_request_review_comment',
  'pull_request_review_thread',
  'push',
  'registry_package',
  'release',
  'repository',
  'repository_dispatch',
  'repository_import',
  'repository_vulnerability_alert',
  'secret_scanning_alert',
  'secret_scanning_alert_location',
  'security_advisory',
  'sponsorship',
  'star',
  'status',
  'team',
  'team_add',
  'watch',
  'workflow_dispatch',
  'workflow_job',
  'workflow_run'
] satisfies Array<WebhookEventName>
export type EventName = (typeof EVENT_NAMES)[number]
export interface WorkflowEventBase {
  eventName: WebhookEventName
  payload: Schema
}
export type WorkflowEvent =
  | {
      eventName: 'branch_protection_rule'
      payload: BranchProtectionRuleEvent
    }
  | {
      eventName: 'check_run'
      payload: CheckRunEvent
    }
  | {
      eventName: 'check_suite'
      payload: CheckSuiteEvent
    }
  | {
      eventName: 'code_scanning_alert'
      payload: CodeScanningAlertEvent
    }
  | {
      eventName: 'commit_comment'
      payload: CommitCommentEvent
    }
  | {
      eventName: 'create'
      payload: CreateEvent
    }
  | {
      eventName: 'delete'
      payload: DeleteEvent
    }
  | {
      eventName: 'dependabot_alert'
      payload: DependabotAlertEvent
    }
  | {
      eventName: 'deploy_key'
      payload: DeployKeyEvent
    }
  | {
      eventName: 'deployment'
      payload: DeploymentEvent
    }
  | {
      eventName: 'deployment_protection_rule'
      payload: DeploymentProtectionRuleEvent
    }
  | {
      eventName: 'deployment_review'
      payload: DeploymentReviewEvent
    }
  | {
      eventName: 'deployment_status'
      payload: DeploymentStatusEvent
    }
  | {
      eventName: 'discussion'
      payload: DiscussionEvent
    }
  | {
      eventName: 'discussion_comment'
      payload: DiscussionCommentEvent
    }
  | {
      eventName: 'fork'
      payload: ForkEvent
    }
  | {
      eventName: 'github_app_authorization'
      payload: GithubAppAuthorizationEvent
    }
  | {
      eventName: 'gollum'
      payload: GollumEvent
    }
  | {
      eventName: 'installation'
      payload: InstallationEvent
    }
  | {
      eventName: 'installation_repositories'
      payload: InstallationRepositoriesEvent
    }
  | {
      eventName: 'installation_target'
      payload: InstallationTargetEvent
    }
  | {
      eventName: 'issue_comment'
      payload: IssueCommentEvent
    }
  | {
      eventName: 'issues'
      payload: IssuesEvent
    }
  | {
      eventName: 'label'
      payload: LabelEvent
    }
  | {
      eventName: 'marketplace_purchase'
      payload: MarketplacePurchaseEvent
    }
  | {
      eventName: 'member'
      payload: MemberEvent
    }
  | {
      eventName: 'membership'
      payload: MembershipEvent
    }
  | {
      eventName: 'merge_group'
      payload: MergeGroupEvent
    }
  | {
      eventName: 'meta'
      payload: MetaEvent
    }
  | {
      eventName: 'milestone'
      payload: MilestoneEvent
    }
  | {
      eventName: 'org_block'
      payload: OrgBlockEvent
    }
  | {
      eventName: 'organization'
      payload: OrganizationEvent
    }
  | {
      eventName: 'package'
      payload: PackageEvent
    }
  | {
      eventName: 'page_build'
      payload: PageBuildEvent
    }
  | {
      eventName: 'ping'
      payload: PingEvent
    }
  | {
      eventName: 'project'
      payload: ProjectEvent
    }
  | {
      eventName: 'project_card'
      payload: ProjectCardEvent
    }
  | {
      eventName: 'project_column'
      payload: ProjectColumnEvent
    }
  | {
      eventName: 'projects_v2_item'
      payload: ProjectsV2ItemEvent
    }
  | {
      eventName: 'public'
      payload: PublicEvent
    }
  | {
      eventName: 'pull_request'
      payload: PullRequestEvent
    }
  | {
      eventName: 'pull_request_review'
      payload: PullRequestReviewEvent
    }
  | {
      eventName: 'pull_request_review_comment'
      payload: PullRequestReviewCommentEvent
    }
  | {
      eventName: 'pull_request_review_thread'
      payload: PullRequestReviewThreadEvent
    }
  | {
      eventName: 'push'
      payload: PushEvent
    }
  | {
      eventName: 'registry_package'
      payload: RegistryPackageEvent
    }
  | {
      eventName: 'release'
      payload: ReleaseEvent
    }
  | {
      eventName: 'repository'
      payload: RepositoryEvent
    }
  | {
      eventName: 'repository_dispatch'
      payload: RepositoryDispatchEvent
    }
  | {
      eventName: 'repository_import'
      payload: RepositoryImportEvent
    }
  | {
      eventName: 'repository_vulnerability_alert'
      payload: RepositoryVulnerabilityAlertEvent
    }
  | {
      eventName: 'secret_scanning_alert'
      payload: SecretScanningAlertEvent
    }
  | {
      eventName: 'secret_scanning_alert_location'
      payload: SecretScanningAlertLocationEvent
    }
  | {
      eventName: 'security_advisory'
      payload: SecurityAdvisoryEvent
    }
  | {
      eventName: 'sponsorship'
      payload: SponsorshipEvent
    }
  | {
      eventName: 'star'
      payload: StarEvent
    }
  | {
      eventName: 'status'
      payload: StatusEvent
    }
  | {
      eventName: 'team'
      payload: TeamEvent
    }
  | {
      eventName: 'team_add'
      payload: TeamAddEvent
    }
  | {
      eventName: 'watch'
      payload: WatchEvent
    }
  | {
      eventName: 'workflow_dispatch'
      payload: WorkflowDispatchEvent
    }
  | {
      eventName: 'workflow_job'
      payload: WorkflowJobEvent
    }
  | {
      eventName: 'workflow_run'
      payload: WorkflowRunEvent
    }
