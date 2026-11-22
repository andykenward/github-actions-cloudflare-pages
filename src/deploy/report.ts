import assert from 'node:assert/strict'

import {debug, warning} from '@actions/core'
import * as Cause from 'effect/Cause'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Ref from 'effect/Ref'

import type {CloudflareApiEndpoint} from '@/common/cloudflare/api/endpoints.js'
import type {DeploymentStatus} from '@/common/cloudflare/deployment/status.js'
import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {CommentContent, CommentState} from '@/common/github/comment.js'
import type {CloudflareStatusFields} from '@/common/github/deployment/deployment-status.js'

import {getCloudflareDeployment} from '@/common/cloudflare/deployment/get.js'
import {deploymentOutcome} from '@/common/cloudflare/deployment/status.js'
import {errorMessage} from '@/common/errors.js'
import {commentBody, updateComment} from '@/common/github/comment.js'
import {GitHubContext} from '@/common/github/context.js'
import {setGitHubDeploymentStatus} from '@/common/github/deployment/create.js'
import {cloudflareStatusFields} from '@/common/github/deployment/deployment-status.js'
import {isNewestDeployment} from '@/common/github/deployment/recent.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

const PREFIX = 'deploy -'

/**
 * How long reporting a failure may take. A cancelled job gets SIGTERM about
 * 7.5 s after SIGINT, then SIGKILL, so this leaves room to exit.
 */
const REPORT_TIMEOUT_SECONDS = 5
const REPORT_TIMEOUT = Duration.seconds(REPORT_TIMEOUT_SECONDS)

/** The GitHub Deployment this run created, and what its comment shows. */
export type DeployRecord = {
  deploymentId: string
  commentId: string | undefined
  cloudflare: CloudflareApiEndpoint
  /** The GitHub Environment's name. */
  environment: string
}

/**
 * The GitHub state and comment for where Cloudflare says a deployment ended.
 * Keyed by Cloudflare's own type, so a status it adds fails the type-check.
 */
export const CLOUDFLARE_OUTCOMES = {
  success: {state: DeploymentStatusState.Success, comment: 'ready'},
  failure: {state: DeploymentStatusState.Failure, comment: 'failed'},
  canceled: {state: DeploymentStatusState.Failure, comment: 'failed'},
  skipped: {state: DeploymentStatusState.Failure, comment: 'failed'}
} as const satisfies Record<
  DeploymentStatus,
  {state: DeploymentStatusState; comment: CommentState}
>

/** What a report records: the status, and the comment that goes with it. */
type Report = {
  state: DeploymentStatusState
  fields: CloudflareStatusFields
  comment: Omit<CommentContent, 'environment' | 'projectName'>
}

/**
 * Updates the comment, unless a newer run's deployment owns it now. A comment
 * that fails to update only warns: the status is the record that matters.
 */
const reportComment = Effect.fn('reportComment')(function* (
  record: DeployRecord,
  comment: Report['comment']
) {
  const {commentId, deploymentId, environment, cloudflare} = record
  if (!commentId) {
    return
  }
  const newest = yield* isNewestDeployment(deploymentId, environment).pipe(
    Effect.catchTag('GitHubApiError', error => {
      warning(
        `${PREFIX} Checking for a newer deployment failed: ${error.message}`
      )
      return Effect.succeed(true)
    })
  )
  if (!newest) {
    debug(`${PREFIX} A newer deployment owns the comment; leaving it.`)
    return
  }
  const context = yield* GitHubContext
  const body = commentBody(
    {...comment, environment, projectName: cloudflare.projectName},
    context
  )
  yield* updateComment(commentId, body).pipe(
    Effect.catchTag('GitHubApiError', error =>
      Effect.sync(() => {
        warning(
          `${PREFIX} Updating the pull request comment failed: ${error.message}`
        )
      })
    )
  )
})

const reportRecord = Effect.fn('reportRecord')(function* (
  record: DeployRecord,
  {state, fields, comment}: Report
) {
  yield* setGitHubDeploymentStatus({
    deploymentId: record.deploymentId,
    environment: record.environment,
    state,
    ...fields
  })
  yield* reportComment(record, comment)
})

/** The deploy succeeded: the deployment is live. */
export const reportSuccess = Effect.fn('reportSuccess')(function* (
  record: DeployRecord,
  deployment: PagesDeployment,
  wranglerOutput: string | undefined
) {
  assert.equal(deploymentOutcome(deployment), 'success')
  yield* reportRecord(record, {
    state: DeploymentStatusState.Success,
    fields: cloudflareStatusFields({...record.cloudflare, ...deployment}),
    comment: {state: 'ready', deployment, wranglerOutput}
  })
})

/**
 * The report for a run that failed or was cancelled after Cloudflare had a
 * deployment: Cloudflare's state decides, not how the action ended — a
 * deployment can go live after a poll times out or the job is cancelled.
 */
const reportFailureCloudflare = (
  {cloudflare}: DeployRecord,
  deployment: PagesDeployment,
  message: string
): Report => {
  const fields = cloudflareStatusFields({...cloudflare, ...deployment})
  const outcome = deploymentOutcome(deployment)
  if (outcome === undefined) {
    return {
      state: DeploymentStatusState.InProgress,
      fields,
      comment: {state: 'building', logUrl: fields.logUrl}
    }
  }
  const {state, comment} = CLOUDFLARE_OUTCOMES[outcome]
  return comment === 'ready'
    ? {
        state,
        fields,
        comment: {
          state: comment,
          deployment,
          note: `Deployed, but the action then failed: ${message}`
        }
      }
    : {state, fields, comment: {state: comment, logUrl: fields.logUrl}}
}

/** The Cloudflare deployment this run made, if it got that far and answers. */
const reportFailureDeployment = Effect.fn('reportFailureDeployment')(function* (
  record: DeployRecord,
  deploymentId: string
) {
  return yield* getCloudflareDeployment({
    ...record.cloudflare,
    deploymentId
  }).pipe(
    Effect.catchTag('CloudflareApiError', error => {
      debug(
        `${PREFIX} Reading the Cloudflare deployment failed: ${error.message}`
      )
      return Effect.undefined
    })
  )
})

const reportFailureReport = Effect.fn('reportFailureReport')(function* (
  record: DeployRecord,
  cause: Cause.Cause<unknown>,
  deploymentIdRef: Ref.Ref<string | undefined>
) {
  const interrupted = Cause.hasInterruptsOnly(cause)
  const message = interrupted
    ? 'the job was cancelled or timed out'
    : errorMessage(Cause.squash(cause))
  const deploymentId = yield* Ref.get(deploymentIdRef)
  const deployment = deploymentId
    ? yield* reportFailureDeployment(record, deploymentId)
    : undefined
  if (deployment) {
    return reportFailureCloudflare(record, deployment, message)
  }
  const {runUrl} = yield* GitHubContext
  // Wrangler failed or was stopped before Cloudflare had a deployment; with
  // only an id (Cloudflare didn't answer), the delete action can still use it.
  const fields: CloudflareStatusFields = deploymentId
    ? cloudflareStatusFields({...record.cloudflare, id: deploymentId})
    : {logUrl: runUrl}
  const report: Report = interrupted
    ? {
        state: DeploymentStatusState.Error,
        fields,
        comment: {state: 'cancelled', logUrl: fields.logUrl}
      }
    : {
        state: DeploymentStatusState.Failure,
        fields,
        comment: {state: 'failed', logUrl: fields.logUrl}
      }
  return report
})

/**
 * Records a failed or cancelled run on its GitHub Deployment and comment.
 * Runs inside `Effect.onError`, so it must not fail: anything that goes wrong
 * here only warns, and the step still fails with the original error.
 */
export const reportDeployFailure = Effect.fn('reportDeployFailure')(
  function* (
    record: DeployRecord,
    cause: Cause.Cause<unknown>,
    deploymentIdRef: Ref.Ref<string | undefined>
  ) {
    const report = yield* reportFailureReport(record, cause, deploymentIdRef)
    yield* reportRecord(record, report)
  },
  effect =>
    effect.pipe(
      Effect.timeout(REPORT_TIMEOUT),
      // The original failure is what the step reports; this one only warns.
      Effect.catchTag(['GitHubApiError', 'TimeoutError'], error =>
        Effect.sync(() => {
          warning(
            `${PREFIX} Recording the failure on GitHub failed: ${errorMessage(error)}`
          )
        })
      )
    )
)
