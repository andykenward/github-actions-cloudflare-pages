import assert from 'node:assert/strict'

import {debug} from '@actions/core'
import * as Context from 'effect/Context'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Predicate from 'effect/Predicate'
import * as Schedule from 'effect/Schedule'
import * as Schema from 'effect/Schema'

import type {GitHubContext} from '@/common/github/context.js'

import type {CloudflareApi, CloudflareApiError} from '../api/client.js'
import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {findCloudflareLatestDeployment, getCloudflareDeployment} from './get.js'

const PREFIX = `Status Of Deployment:`

/**
 * How long to wait between polls. A `Context.Reference` rather than an
 * argument: production never overrides it, and tests provide zero instead of
 * threading a test-only option through `createCloudflareDeployment`.
 */
export const PollInterval = Context.Reference<Duration.Duration>(
  'github-actions-cloudflare-pages/common/cloudflare/deployment/status/PollInterval',
  {defaultValue: () => Duration.seconds(1)}
)

/** README and `action.yml` document the 10 minutes. */
const POLL_TIMEOUT_MINUTES = 10

/**
 * The ceiling on polling. Without one the action spun until the job timeout
 * killed it.
 */
export const PollTimeout = Context.Reference<Duration.Duration>(
  'github-actions-cloudflare-pages/common/cloudflare/deployment/status/PollTimeout',
  {defaultValue: () => Duration.minutes(POLL_TIMEOUT_MINUTES)}
)

/**
 * With the defaults, 10 minutes at one poll a second is 600 polls, so the
 * duration is the operative ceiling; the count is the belt for a zero interval
 * (tests) or a stalled clock, where a duration alone bounds nothing.
 */
const POLL_COUNT_MAX = 1000

/** The most polls a deploy makes before giving up, whatever the clock says. */
export const PollCountMax = Context.Reference<number>(
  'github-actions-cloudflare-pages/common/cloudflare/deployment/status/PollCountMax',
  {defaultValue: () => POLL_COUNT_MAX}
)

export type DeploymentStatus = Exclude<
  PagesDeployment['latest_stage']['status'],
  'idle' | 'active'
>

type StatusResult = {
  deployment: PagesDeployment
  status: DeploymentStatus
}

/**
 * Cloudflare has not reached a terminal stage yet. Retryable, unlike a
 * transport or envelope failure.
 */
// oxlint-disable-next-line unicorn/throw-new-error
class DeploymentPendingError extends Schema.TaggedError<DeploymentPendingError>()(
  'DeploymentPendingError',
  {reason: Schema.String}
) {}

// oxlint-disable-next-line unicorn/throw-new-error
class DeploymentPollTimeoutError extends Schema.TaggedError<DeploymentPollTimeoutError>()(
  'DeploymentPollTimeoutError',
  {message: Schema.String}
) {}

export type DeploymentTarget = CloudflareApiEndpoint & {
  /**
   * The id wrangler reported. Without one, the deployment is found by commit
   * hash.
   */
  deploymentId?: string | undefined
}

const pollOnce = Effect.fn('pollOnce')(function* (
  target: DeploymentTarget
): Effect.fn.Return<
  StatusResult,
  DeploymentPendingError | CloudflareApiError,
  CloudflareApi | GitHubContext
> {
  const {deploymentId, ...endpoint} = target
  const deployment =
    deploymentId === undefined
      ? yield* findCloudflareLatestDeployment(endpoint)
      : yield* getCloudflareDeployment({...endpoint, deploymentId})

  if (deployment === undefined) {
    return yield* new DeploymentPendingError({reason: 'not-registered'})
  }
  assert.ok(deployment.id.length > 0)
  if (deploymentId !== undefined) {
    assert.equal(deployment.id, deploymentId)
  }

  const {latest_stage} = deployment
  const {name, status} = latest_stage

  debug(`${PREFIX} ${JSON.stringify(latest_stage)}`)

  // Any stage failing, canceled or skipped ends the deploy; only the `deploy`
  // stage succeeding completes it. Anything else — an earlier stage done, or
  // a stage `idle` / `active` — is still running, as wrangler also treats it.
  // A skipped stage never resumes, so waiting on it only ends in the timeout.
  if (status === 'failure' || status === 'canceled' || status === 'skipped') {
    return {deployment, status}
  }
  if (status === 'success' && name === 'deploy') {
    return {deployment, status}
  }
  return yield* new DeploymentPendingError({
    reason: `stage '${name}' is ${status}`
  })
})

/** The first HTTP status that means the server, not the request, failed. */
const HTTP_STATUS_SERVER_ERROR_MIN = 500

/**
 * A failure of the transport rather than an answer from Cloudflare: no
 * response at all, or a 5xx without an envelope (an HTML 502 from the edge).
 * One of these during a ten-minute poll shouldn't fail a finished deploy, and
 * would leave the Cloudflare deployment with no comment or GitHub Deployment.
 * An envelope error (a bad id, a token without the permission) is an answer,
 * and is not retried.
 */
const isTransientError = (error: CloudflareApiError): boolean =>
  error.reason._tag === 'RequestError' ||
  (error.reason._tag === 'HttpError' &&
    error.reason.status >= HTTP_STATUS_SERVER_ERROR_MIN)

/**
 * Deliberately a plain boolean predicate rather than a refinement: as a
 * refinement, `Effect.retry`'s result type would claim a retried error cannot
 * escape, but the last failure still propagates when the schedule itself is
 * exhausted.
 */
const isRetryable = (
  error: DeploymentPendingError | CloudflareApiError
): boolean =>
  Predicate.isTagged(error, 'DeploymentPendingError') || isTransientError(error)

/**
 * Polls the deployment until it reaches a terminal stage — by id when wrangler
 * reported one, otherwise the newest deployment for the context commit. A
 * pending stage and a transient failure (`isTransientError`) are retried on
 * the same bounded schedule; any other `CloudflareApiError` fails at once.
 */
export const statusCloudflareDeployment = Effect.fn(
  'statusCloudflareDeployment'
)(function* (target: DeploymentTarget) {
  const pollInterval = yield* PollInterval
  const pollTimeout = yield* PollTimeout
  const pollCountMax = yield* PollCountMax
  assert.ok(pollCountMax >= 1)
  assert.ok(Duration.toMillis(pollTimeout) > 0)

  return yield* pollOnce(target).pipe(
    // A user can't act on a blip that the next poll recovers from, so it goes
    // to the debug log; one that exhausts the schedule still fails the step.
    Effect.tapError(error =>
      Effect.sync(() => {
        if (Predicate.isTagged(error, 'CloudflareApiError')) {
          debug(`${PREFIX} ${error.message}`)
        }
      })
    ),
    Effect.retry({
      while: isRetryable,
      // Bounded both ways. `times` counts schedule steps, and the effect runs
      // once before the first step, so the poll runs at most `times + 1`.
      schedule: Schedule.spaced(pollInterval).pipe(
        Schedule.upTo({duration: pollTimeout, times: pollCountMax})
      )
    }),
    // `Schedule.upTo` is only observed on the following schedule step, so a
    // hung request could outlive it. This is the actual ceiling.
    Effect.timeout(pollTimeout),
    // The poll ran out of time or polls, by either route: the retry schedule
    // exhausted (propagating the last `DeploymentPendingError`) or the overall
    // `Effect.timeout` fired. `CloudflareApiError` deliberately falls through
    // so a failed request, transient or not, surfaces with its own message.
    Effect.catchTag(
      ['DeploymentPendingError', 'TimeoutError'],
      () =>
        new DeploymentPollTimeoutError({
          message: `${PREFIX} timed out after ${Duration.format(pollTimeout)} waiting for the deploy stage to complete.`
        })
    )
  )
})
