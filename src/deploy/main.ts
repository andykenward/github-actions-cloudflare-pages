import {warning} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Ref from 'effect/Ref'
import * as Schema from 'effect/Schema'

import type {CommentContent} from '@/common/github/comment.js'
import type {RecentDeployment} from '@/common/github/deployment/recent.js'
import type {WebhookEventName} from '@/types/github/workflow-events.js'

import {createCloudflareDeployment} from '@/common/cloudflare/deployment/create.js'
import {
  commentBody,
  pullRequestToComment,
  upsertComment
} from '@/common/github/comment.js'
import {GitHubContext} from '@/common/github/context.js'
import {createGitHubDeployment} from '@/common/github/deployment/create.js'
import {
  getRecentDeployments,
  previousCommentId
} from '@/common/github/deployment/recent.js'
import {checkEnvironment} from '@/common/github/environment.js'
import {CommonLayer} from '@/common/layer.js'

import {DeployInputs} from './inputs.js'
import {reportDeployFailure, reportSuccess} from './report.js'
import {sweepStaleDeployments} from './sweep.js'

const PREFIX = 'deploy -'

/** Only these events carry the context the deploy needs. */
const SUPPORTED_EVENT_NAMES = new Set<string>([
  'push',
  'pull_request',
  'workflow_dispatch',
  'workflow_run'
] as const satisfies ReadonlyArray<WebhookEventName>)

/**
 * `message` is what `Error.message` resolves to, so `index.ts` only has to
 * surface it via `setFailed`.
 */
// oxlint-disable-next-line unicorn/throw-new-error
class DeployError extends Schema.TaggedError<
  DeployError,
  {readonly brand: unique symbol}
>()('DeployError', {
  message: Schema.String
}) {}

/** Every service `run` needs, built from the action inputs and runner env. */
export const DeployLayer = Layer.mergeAll(CommonLayer, DeployInputs.layer)

type Inputs = DeployInputs['Service']

/**
 * The recent deployments only help (reusing the comment, sweeping abandoned
 * runs), so failing to read them only warns.
 */
const runPrepareRecent = Effect.fn('runPrepareRecent')(
  function* (environment: string) {
    return yield* getRecentDeployments(environment)
  },
  effect =>
    Effect.catchTag(effect, 'GitHubApiError', failure => {
      warning(
        `${PREFIX} Reading recent deployments failed; posting a new comment: ${failure.message}`
      )
      return Effect.succeed<ReadonlyArray<RecentDeployment>>([])
    })
)

/**
 * The environment check and the pull request lookup run concurrently, both
 * before wrangler now: the GitHub Deployment is created first, as
 * `IN_PROGRESS`, so a failed build still shows on the pull request. The
 * recent deployments are read by the environment's own name, as the
 * deployments were recorded under it.
 */
const runPrepare = Effect.fn('runPrepare')(function* (inputs: Inputs) {
  const [environment, pullRequestId] = yield* Effect.all(
    [
      checkEnvironment(inputs.gitHubEnvironment),
      pullRequestToComment(inputs.pullRequestNumber)
    ],
    {concurrency: 'unbounded'}
  )
  const recent = yield* runPrepareRecent(environment.name)
  return [environment, pullRequestId, recent] as const
})

/**
 * Posts the in-progress comment, editing the previous one. A failed comment
 * must not lose the GitHub Deployment: without that record the delete action
 * can never find the Cloudflare deployment. Warn and go on without one.
 */
const runComment = Effect.fn('runComment')(function* (
  pullRequestId: string | undefined,
  previousCommentId: string | undefined,
  content: CommentContent
) {
  const context = yield* GitHubContext
  return yield* upsertComment(
    pullRequestId,
    previousCommentId,
    commentBody(content, context)
  ).pipe(
    Effect.catchTag('GitHubApiError', error => {
      warning(
        `${PREFIX} Posting the pull request comment failed; recording the deployment without one: ${error.message}`
      )
      return Effect.undefined
    })
  )
})

/**
 * Exported as an Effect value rather than a function: Effect is already lazy,
 * so a zero-argument wrapper is pure indirection (`effecttsgo/lazy-effect`).
 * Requires the services in `DeployLayer`; tests can provide their own.
 */
export const run = Effect.gen(function* () {
  const inputs = yield* DeployInputs
  const {event} = yield* GitHubContext

  if (!SUPPORTED_EVENT_NAMES.has(event.eventName)) {
    return yield* new DeployError({
      message: `GitHub Action event name '${event.eventName}' not supported.`
    })
  }

  const [environment, pullRequestId, recent] = yield* runPrepare(inputs)
  const cloudflare = {
    accountId: inputs.cloudflareAccountId,
    projectName: inputs.cloudflareProjectName
  }

  const commentId = yield* runComment(
    pullRequestId,
    previousCommentId(recent),
    {
      state: 'building',
      environment: environment.name,
      projectName: cloudflare.projectName
    }
  )
  const deploymentId = yield* createGitHubDeployment({
    cloudflare,
    commentId,
    environment
  })
  const record = {
    deploymentId,
    commentId,
    cloudflare,
    environment: environment.name
  }

  yield* sweepStaleDeployments(recent, {
    environment: environment.name,
    cloudflare
  })

  // oxlint-disable-next-line unicorn/no-useless-undefined
  const deploymentIdRef = yield* Ref.make<string | undefined>(undefined)
  const {deployment, wranglerOutput} = yield* createCloudflareDeployment({
    ...cloudflare,
    directory: inputs.directory,
    workingDirectory: inputs.workingDirectory,
    branch: inputs.branch,
    wranglerVersion: inputs.wranglerVersion,
    deploymentIdRef
  }).pipe(
    Effect.onError(cause => reportDeployFailure(record, cause, deploymentIdRef))
  )

  yield* reportSuccess(
    record,
    deployment,
    inputs.wranglerCommentOutput ? wranglerOutput : undefined
  )
})
