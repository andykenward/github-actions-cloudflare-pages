import {debug} from '@actions/core'
import * as Cause from 'effect/Cause'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import * as Schedule from 'effect/Schedule'
import * as Schema from 'effect/Schema'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {findCloudflareLatestDeployment} from './get.js'

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
  'idle'
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

const pollOnce = (
  apiEndpoint: CloudflareApiEndpoint
): Effect.Effect<StatusResult, unknown> =>
  Effect.gen(function* () {
    const deployment = yield* Effect.tryPromise({
      try: () => findCloudflareLatestDeployment(apiEndpoint),
      // Surface transport/envelope errors (e.g. ParseError) unchanged.
      catch: (cause: unknown) => cause
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
      case 'active':
      case 'success': {
        if (latest_stage.name === 'deploy') {
          return {deployment, status: latest_stage.status}
        }
        return yield* new DeploymentPendingError({
          reason: `stage '${latest_stage.name}' is ${latest_stage.status}`
        })
      }
      default: {
        return yield* new DeploymentPendingError({
          reason: `stage '${latest_stage.name}' is ${latest_stage.status}`
        })
      }
    }
  })

const isPending = (error: unknown): boolean =>
  error instanceof DeploymentPendingError

/**
 * The poll ran out of time, by either route: the retry schedule exhausted
 * (propagating the last `DeploymentPendingError`) or the overall
 * `Effect.timeout` fired. Transport failures such as `ParseError` deliberately
 * fall through so they surface unchanged.
 */
const isPollExhausted = (error: unknown): boolean =>
  isPending(error) ||
  (typeof error === 'object' &&
    error !== null &&
    '_tag' in error &&
    error._tag === 'TimeoutError')

export type StatusOptions = {
  pollInterval?: Duration.Input
  pollTimeout?: Duration.Input
}

export const statusCloudflareDeployment = async (
  apiEndpoint: CloudflareApiEndpoint,
  options?: StatusOptions
): Promise<StatusResult> => {
  const pollInterval = options?.pollInterval ?? DEFAULT_POLL_INTERVAL
  const pollTimeout = options?.pollTimeout ?? DEFAULT_POLL_TIMEOUT

  const program = pollOnce(apiEndpoint).pipe(
    Effect.retry({
      // `while` must stay a plain boolean predicate: with a refinement the
      // result type would claim a pending error cannot escape, but the last
      // failure still propagates when the schedule itself is exhausted.
      while: isPending,
      schedule: Schedule.spaced(pollInterval).pipe(
        Schedule.upTo({duration: pollTimeout})
      )
    }),
    // `Schedule.upTo` is only observed on the following schedule step, so a
    // hung request could outlive it. This is the actual ceiling.
    Effect.timeout(pollTimeout),
    Effect.catchIf(
      isPollExhausted,
      () =>
        new DeploymentPollTimeoutError({
          message: `${ERROR_KEY} timed out after ${Duration.format(Duration.fromInputUnsafe(pollTimeout))} waiting for the deploy stage to complete.`
        })
    )
  )

  const exit = await Effect.runPromiseExit(program)

  if (Exit.isSuccess(exit)) {
    return exit.value
  }

  // Rethrow the original error so callers keep seeing e.g. `ParseError`
  // rather than an Effect wrapper.
  throw Cause.squash(exit.cause)
}
