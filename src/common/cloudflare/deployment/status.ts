import {debug} from '@actions/core'
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

/** Matches the previous fixed 1s poll cadence. */
const DEFAULT_POLL_INTERVAL = Duration.seconds(1)

/**
 * The previous implementation had no ceiling at all — it span until the
 * GitHub Actions job timeout killed it.
 */
const DEFAULT_POLL_TIMEOUT = Duration.minutes(10)

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

export type StatusOptions = {
  pollInterval?: Duration.Input
  pollTimeout?: Duration.Input
}

/**
 * Polls the deployment until it reaches a terminal stage — by id when wrangler
 * reported one, otherwise the newest deployment for the context commit.
 * `CloudflareApiError` (transport or envelope failures) is not retried.
 */
export const statusCloudflareDeployment = Effect.fn(
  'statusCloudflareDeployment'
)((target: DeploymentTarget, options?: StatusOptions) => {
  const pollInterval = options?.pollInterval ?? DEFAULT_POLL_INTERVAL
  const pollTimeout = options?.pollTimeout ?? DEFAULT_POLL_TIMEOUT

  return pollOnce(target).pipe(
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
          message: `${ERROR_KEY} timed out after ${Duration.format(Duration.fromInputUnsafe(pollTimeout))} waiting for the deploy stage to complete.`
        })
    )
  )
})
