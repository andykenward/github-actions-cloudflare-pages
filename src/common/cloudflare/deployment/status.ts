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

const ERROR_KEY = `Status Of Deployment:`

/**
 * How long to wait between polls. A `Context.Reference` rather than an
 * argument: production never overrides it, and tests provide zero instead of
 * threading a test-only option through `createCloudflareDeployment`.
 */
export const PollInterval = Context.Reference<Duration.Duration>(
  'github-actions-cloudflare-pages/common/cloudflare/deployment/status/PollInterval',
  {defaultValue: () => Duration.seconds(1)}
)

/**
 * The ceiling on polling. Without one the action spun until the job timeout
 * killed it; README and `action.yml` document the 10 minutes.
 */
export const PollTimeout = Context.Reference<Duration.Duration>(
  'github-actions-cloudflare-pages/common/cloudflare/deployment/status/PollTimeout',
  {defaultValue: () => Duration.minutes(10)}
)

type DeploymentStatus = Exclude<
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
  const deployment =
    target.deploymentId === undefined
      ? yield* findCloudflareLatestDeployment(target)
      : yield* getCloudflareDeployment({
          ...target,
          deploymentId: target.deploymentId
        })

  if (deployment === undefined) {
    return yield* new DeploymentPendingError({reason: 'not-registered'})
  }

  const {latest_stage} = deployment

  debug(JSON.stringify(latest_stage))

  switch (latest_stage.status) {
    case 'failure':
    case 'canceled': {
      return {deployment, status: latest_stage.status}
    }
    case 'success': {
      if (latest_stage.name === 'deploy') {
        return {deployment, status: latest_stage.status}
      }
      return yield* new DeploymentPendingError({
        reason: `stage '${latest_stage.name}' is ${latest_stage.status}`
      })
    }
    // `idle`, or `active`: the stage is still running — wrangler, too, only
    // treats a deploy as complete on `success`.
    default: {
      return yield* new DeploymentPendingError({
        reason: `stage '${latest_stage.name}' is ${latest_stage.status}`
      })
    }
  }
})

/**
 * Deliberately a plain boolean predicate rather than `Predicate.isTagged`
 * itself: as a refinement, `Effect.retry`'s result type would claim a pending
 * error cannot escape, but the last failure still propagates when the schedule
 * itself is exhausted.
 */
const isPending = (error: unknown): boolean =>
  Predicate.isTagged(error, 'DeploymentPendingError')

/**
 * Polls the deployment until it reaches a terminal stage — by id when wrangler
 * reported one, otherwise the newest deployment for the context commit.
 * `CloudflareApiError` (transport or envelope failures) is not retried.
 */
export const statusCloudflareDeployment = Effect.fn(
  'statusCloudflareDeployment'
)(function* (target: DeploymentTarget) {
  const pollInterval = yield* PollInterval
  const pollTimeout = yield* PollTimeout

  return yield* pollOnce(target).pipe(
    Effect.retry({
      while: isPending,
      schedule: Schedule.spaced(pollInterval).pipe(
        Schedule.upTo({duration: pollTimeout})
      )
    }),
    // `Schedule.upTo` is only observed on the following schedule step, so a
    // hung request could outlive it. This is the actual ceiling.
    Effect.timeout(pollTimeout),
    // The poll ran out of time, by either route: the retry schedule exhausted
    // (propagating the last `DeploymentPendingError`) or the overall
    // `Effect.timeout` fired. `CloudflareApiError` deliberately falls through
    // so transport failures surface unchanged.
    Effect.catchTag(
      ['DeploymentPendingError', 'TimeoutError'],
      () =>
        new DeploymentPollTimeoutError({
          message: `${ERROR_KEY} timed out after ${Duration.format(pollTimeout)} waiting for the deploy stage to complete.`
        })
    )
  )
})
