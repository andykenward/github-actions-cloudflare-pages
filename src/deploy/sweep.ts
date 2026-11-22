import {debug, info, warning} from '@actions/core'
import * as Clock from 'effect/Clock'
import * as DateTime from 'effect/DateTime'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'

import type {CloudflareApiEndpoint} from '@/common/cloudflare/api/endpoints.js'
import type {RecentDeployment} from '@/common/github/deployment/recent.js'

import {
  findCloudflareLatestDeployment,
  getCloudflareDeployment
} from '@/common/cloudflare/deployment/get.js'
import {deploymentOutcome} from '@/common/cloudflare/deployment/status.js'
import {setGitHubDeploymentStatus} from '@/common/github/deployment/create.js'
import {
  cloudflareIdFromStatus,
  cloudflareStatusFields
} from '@/common/github/deployment/deployment-status.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

import {CLOUDFLARE_OUTCOMES} from './report.js'

const PREFIX = 'deploy sweep -'

/**
 * How old an `IN_PROGRESS` deployment must be before it counts as abandoned:
 * longer than any live run can take (wrangler's 30-minute timeout plus the
 * 10-minute poll), so a concurrent run on the branch is never touched.
 */
const STALE_AGE_MINUTES = 45
const STALE_AGE = Duration.minutes(STALE_AGE_MINUTES)

/**
 * The Cloudflare deployment a stale GitHub Deployment stands for: by the id
 * its status recorded, else the newest for its commit. The commit match is
 * only used to set a status, never to delete: a re-run of one commit makes
 * several Cloudflare deployments.
 */
const sweepStaleCloudflare = Effect.fn('sweepStaleCloudflare')(function* (
  deployment: RecentDeployment,
  cloudflare: CloudflareApiEndpoint
) {
  const id = deployment.latestStatus
    ? cloudflareIdFromStatus(deployment.latestStatus, cloudflare)
    : undefined
  if (id) {
    return yield* getCloudflareDeployment({...cloudflare, deploymentId: id})
  }
  if (!deployment.commit) {
    return
  }
  return yield* findCloudflareLatestDeployment({
    ...cloudflare,
    commitHash: deployment.commit.oid
  })
})

/** Sets one stale deployment's status from what Cloudflare says. */
const sweepStale = Effect.fn('sweepStale')(
  function* (
    deployment: RecentDeployment,
    {environment, cloudflare}: SweepTarget
  ) {
    const found = yield* sweepStaleCloudflare(deployment, cloudflare)
    const outcome = found ? deploymentOutcome(found) : undefined
    if (found && outcome === undefined) {
      debug(`${PREFIX} ${deployment.id} is still building on Cloudflare.`)
      return
    }
    const state = outcome
      ? CLOUDFLARE_OUTCOMES[outcome].state
      : DeploymentStatusState.Error
    info(`${PREFIX} Marking abandoned deployment ${deployment.id} ${state}.`)
    yield* setGitHubDeploymentStatus({
      deploymentId: deployment.id,
      environment,
      state,
      ...(found && cloudflareStatusFields({...cloudflare, ...found}))
    })
  },
  (effect, deployment) =>
    effect.pipe(
      // One deployment the sweep can't settle mustn't stop the deploy.
      Effect.catchTag(['GitHubApiError', 'CloudflareApiError'], error =>
        Effect.sync(() => {
          warning(
            `${PREFIX} Settling ${deployment.id} failed: ${error.message}`
          )
        })
      )
    )
)

type SweepTarget = {environment: string; cloudflare: CloudflareApiEndpoint}

const isStale = (deployment: RecentDeployment, now: number): boolean =>
  deployment.latestStatus?.state === DeploymentStatusState.InProgress &&
  Option.match(DateTime.make(deployment.createdAt), {
    onNone: () => false,
    onSome: createdAt =>
      now - DateTime.toEpochMillis(createdAt) > Duration.toMillis(STALE_AGE)
  })

/**
 * Settles the branch's deployments that a run left `IN_PROGRESS` — killed, or
 * its runner lost — so they don't stay pending forever. Never fails.
 */
export const sweepStaleDeployments = Effect.fn('sweepStaleDeployments')(
  function* (
    deployments: ReadonlyArray<RecentDeployment>,
    target: SweepTarget
  ) {
    const now = yield* Clock.currentTimeMillis
    const stale = deployments.filter(deployment => isStale(deployment, now))
    // `deployments` is at most one page of 100, so this is bounded.
    // oxlint-disable-next-line unicorn/no-array-for-each
    yield* Effect.forEach(stale, deployment => sweepStale(deployment, target), {
      discard: true
    })
  }
)
