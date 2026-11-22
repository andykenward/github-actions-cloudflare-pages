import assert from 'node:assert/strict'

import * as Effect from 'effect/Effect'

import type {GetRecentDeploymentsQuery} from '@/gql/graphql.js'

import {GetRecentDeploymentsDocument} from '@/gql/graphql.js'

import {GitHubApi} from '../api/client.js'
import {GitHubContext} from '../context.js'
import {payloadCommentId} from './payload.js'

type RecentDeploymentNode = NonNullable<
  NonNullable<
    NonNullable<GetRecentDeploymentsQuery['repository']>['deployments']['nodes']
  >[number]
>

/** A deployment of the context branch, newest first in a list. */
export type RecentDeployment = RecentDeploymentNode

/**
 * The newest deployments of `environment` on the context branch, newest
 * first.
 *
 * shortcut: only the environment's 100 newest deployments are searched, so a
 * branch idle for longer than that gets a new comment; page with `after` if
 * that turns out to matter.
 */
export const getRecentDeployments = Effect.fn('getRecentDeployments')(
  function* (environment: string) {
    assert.ok(environment.length > 0)
    const {repo, branch} = yield* GitHubContext
    const github = yield* GitHubApi

    const {data} = yield* github.request({
      query: GetRecentDeploymentsDocument,
      variables: {owner: repo.owner, repo: repo.repo, environment}
    })

    const nodes = data?.repository?.deployments.nodes ?? []
    return nodes.filter(
      (node): node is RecentDeployment =>
        node !== null && node.ref?.name === branch
    )
  }
)

/**
 * The comment the newest of `deployments` recorded, to edit in place rather
 * than post another.
 */
export const previousCommentId = (
  deployments: ReadonlyArray<RecentDeployment>
): string | undefined => {
  // At most the one page `getRecentDeployments` reads.
  for (const {payload} of deployments) {
    const commentId = payloadCommentId(payload)
    if (commentId) {
      return commentId
    }
  }
  return undefined
}

/**
 * Whether `deploymentId` is still the newest deployment of `environment` on
 * the context branch. An older run that finishes late must not overwrite the
 * comment a newer run has written. A deployment not listed yet was only just
 * created, so it counts as the newest.
 */
export const isNewestDeployment = Effect.fn('isNewestDeployment')(function* (
  deploymentId: string,
  environment: string
) {
  const deployments = yield* getRecentDeployments(environment)
  const index = deployments.findIndex(({id}) => id === deploymentId)
  return index <= 0
})
