import assert from 'node:assert/strict'

import {error, info, warning} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Result from 'effect/Result'

import {
  DeactivateAndDeleteGitHubDeploymentAndCommentDocument,
  DeactivateAndDeleteGitHubDeploymentDocument,
  DeploymentStatusState
} from '@/gql/graphql.js'

import type {CloudflareApi} from './cloudflare/api/client.js'
import type {GitHubDeployment} from './github/deployment/get.js'
import type {PayloadV1Inputs} from './inputs.js'

import {deleteCloudflareDeployment} from './cloudflare/deployment/delete.js'
import {errorMessage} from './errors.js'
import {formatGraphqlErrors, GitHubApi} from './github/api/client.js'
import {deploymentStatusInput} from './github/deployment/deployment-status.js'
import {getPayload} from './github/deployment/payload.js'

/**
 * Log prefix for the delete action. Declared here rather than in
 * `src/delete/`, which imports this module, so the dependency points one way.
 */
export const PREFIX = `delete -`

export type BatchDeleteItem = {
  deploymentId: string
  success: boolean
  environment: string
  environmentUrl?: string
  commentId?: string
  error?: string
  /** Deleted, but a follow-up mutation failed. */
  warning?: string
}

type Outcome =
  | {success: true; warning?: string}
  | {success: false; error: string}

/** The summary row for `deployment`, with what its payload gave, if decoded. */
const batchDeleteRow = (
  deployment: GitHubDeployment,
  outcome: Outcome,
  payload?: {url: string; commentId: string | undefined}
): BatchDeleteItem => {
  assert.ok(deployment.node_id.length > 0)
  // A failed row must say why: the summary's Error column is its only trace.
  assert.ok(outcome.success || outcome.error.length > 0)
  return {
    deploymentId: deployment.node_id,
    environment: deployment.environment,
    ...(payload && {environmentUrl: payload.url, commentId: payload.commentId}),
    ...outcome
  }
}

/**
 * One GraphQL request that marks the GitHub deployment inactive and deletes
 * it — with its comment when the payload recorded one. Errors are returned,
 * not thrown, so the caller can tell which mutation failed.
 */
const batchDeleteGitHubRequest = Effect.fn('batchDeleteGitHubRequest')(
  function* (
    deployment: GitHubDeployment,
    {
      url,
      commentId,
      cloudflare
    }: {
      url: string
      commentId: string | undefined
      cloudflare: {id: string; accountId: string; projectName: string}
    }
  ) {
    const github = yield* GitHubApi

    const variables = {
      status: deploymentStatusInput({
        deploymentId: deployment.node_id,
        environment: deployment.environment,
        url,
        cloudflare,
        state: DeploymentStatusState.Inactive
      }),
      deployment: {id: deployment.node_id}
    }

    if (commentId) {
      return yield* github.request({
        query: DeactivateAndDeleteGitHubDeploymentAndCommentDocument,
        variables: {...variables, comment: {id: commentId}},
        options: {errorThrows: false}
      })
    }
    return yield* github.request({
      query: DeactivateAndDeleteGitHubDeploymentDocument,
      variables,
      options: {errorThrows: false}
    })
  }
)

/**
 * Deletes one deployment from Cloudflare and GitHub. Never fails: a failure
 * comes back as a `success: false` row, so the rest still get deleted. The
 * explicit type pins the `never` error channel the `Effect.catch` below gives.
 */
export const batchDelete: (
  deployment: GitHubDeployment
) => Effect.Effect<
  BatchDeleteItem,
  never,
  CloudflareApi | GitHubApi | PayloadV1Inputs
> = Effect.fn('batchDelete')(
  function* (deployment: GitHubDeployment) {
    const {commentId, url, cloudflare} = yield* getPayload(deployment.payload)
    const payload = {url, commentId}

    // Delete the Cloudflare deployment first; GitHub's record follows it.
    const deleted = yield* Effect.result(deleteCloudflareDeployment(cloudflare))

    if (Result.isFailure(deleted)) {
      // Include the reason, so a failed delete says why.
      error(
        `Cloudflare Error deleting deployment: ${cloudflare.id} - ${deleted.failure.message}`
      )
      return batchDeleteRow(
        deployment,
        {success: false, error: 'Deleting Cloudflare deployment failed'},
        payload
      )
    }

    // Then mark the GitHub deployment inactive and delete it, with its
    // comment, in one request.
    const {data, errors} = yield* batchDeleteGitHubRequest(deployment, {
      url,
      commentId,
      cloudflare
    })

    const warn = (what: string): void => {
      warning(`${PREFIX} ${what}: ${formatGraphqlErrors(errors ?? [])}`)
    }

    // No `data`, or an error without a `path`, means GitHub ran none of the
    // mutations: a rate limit, or a request it rejected as invalid.
    if (!data || errors?.some(error => !error.path)) {
      warn('GitHub ran none of the deployment mutations')
      return batchDeleteRow(
        deployment,
        {success: false, error: 'Deleting GitHub deployment failed'},
        payload
      )
    }

    if (errors?.some(error => error.path?.[0] === 'createDeploymentStatus')) {
      warn('Error updating GitHub deployment status')
      return batchDeleteRow(
        deployment,
        {success: false, error: 'Updating GitHub deployment status failed'},
        payload
      )
    }

    info(`${PREFIX} GitHub Deployment Deleted: ${deployment.node_id}`)

    // The status was set; a later mutation (deleting the deployment or its
    // comment) failed. The row succeeds but records it, so the summary says.
    if (errors) {
      warn('Error deleting GitHub deployment or its comment')
      return batchDeleteRow(
        deployment,
        {
          success: true,
          warning: `Deleting the GitHub deployment or its comment failed: ${formatGraphqlErrors(errors)}`
        },
        payload
      )
    }

    return batchDeleteRow(deployment, {success: true}, payload)
  },
  (effect, deployment) =>
    Effect.catch(effect, failure => {
      // Any failure lands here — an invalid payload, but also network and API
      // errors — so name the deployment rather than blaming the payload.
      const message = errorMessage(failure)
      warning(
        `${PREFIX} Error deleting deployment ${deployment.node_id}: ${message}`
      )

      return Effect.succeed(
        batchDeleteRow(deployment, {success: false, error: message})
      )
    })
)
