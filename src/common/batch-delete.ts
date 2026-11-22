import assert from 'node:assert/strict'

import {error, info, warning} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Result from 'effect/Result'

import {
  DeactivateAndDeleteGitHubDeploymentAndCommentDocument,
  DeactivateAndDeleteGitHubDeploymentDocument,
  DeploymentStatusState,
  GetDeploymentLatestStatusDocument
} from '@/gql/graphql.js'

import type {CloudflareApi} from './cloudflare/api/client.js'
import type {CloudflareApiEndpoint} from './cloudflare/api/endpoints.js'
import type {CloudflareStatusFields} from './github/deployment/deployment-status.js'
import type {GitHubDeployment} from './github/deployment/get.js'
import type {PayloadGithubDeployment} from './github/deployment/types.js'
import type {PayloadV1Inputs} from './inputs.js'

import {deleteCloudflareDeployment} from './cloudflare/deployment/delete.js'
import {errorMessage} from './errors.js'
import {formatGraphqlErrors, GitHubApi} from './github/api/client.js'
import {
  cloudflareIdFromStatus,
  cloudflareStatusFields,
  deploymentStatusInput
} from './github/deployment/deployment-status.js'
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
  payload?: {url: string | undefined; commentId: string | undefined}
): BatchDeleteItem => {
  assert.ok(deployment.node_id.length > 0)
  // A failed row must say why: the summary's Error column is its only trace.
  assert.ok(outcome.success || outcome.error.length > 0)
  return {
    deploymentId: deployment.node_id,
    environment: deployment.environment,
    ...(payload?.url !== undefined && {environmentUrl: payload.url}),
    ...(payload && {commentId: payload.commentId}),
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
      fields,
      commentId
    }: {fields: CloudflareStatusFields; commentId: string | undefined}
  ) {
    const github = yield* GitHubApi

    // The `INACTIVE` status re-records the Cloudflare deployment: a run that
    // sets it but fails to delete must still find the id on its retry.
    const variables = {
      status: deploymentStatusInput({
        deploymentId: deployment.node_id,
        environment: deployment.environment,
        state: DeploymentStatusState.Inactive,
        ...fields
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
 * A V3 payload has no Cloudflare id or URL: the deploy recorded them on the
 * deployment's latest status. Older payloads carry both.
 */
const batchDeleteResolve = Effect.fn('batchDeleteResolve')(function* (
  deployment: GitHubDeployment,
  {url, cloudflare}: PayloadGithubDeployment
) {
  const {id, ...endpoint} = cloudflare
  if (id !== undefined) {
    return {id, url, fields: cloudflareStatusFields({...endpoint, id, url})}
  }
  const github = yield* GitHubApi
  const {data} = yield* github.request({
    query: GetDeploymentLatestStatusDocument,
    variables: {id: deployment.node_id}
  })
  const status =
    data?.node && 'latestStatus' in data.node
      ? (data.node.latestStatus ?? undefined)
      : undefined
  const statusId = status ? cloudflareIdFromStatus(status, endpoint) : undefined
  const statusUrl = status?.environmentUrl ?? undefined
  if (statusId !== undefined) {
    return {
      id: statusId,
      url: statusUrl,
      fields: cloudflareStatusFields({
        ...endpoint,
        id: statusId,
        url: statusUrl
      })
    }
  }
  // The run failed or was cancelled before Cloudflare had a deployment.
  return {
    id: undefined,
    url: statusUrl,
    fields: {environmentUrl: statusUrl, logUrl: status?.logUrl ?? undefined}
  }
})

/** A run that never reached Cloudflare has no deployment there to delete. */
const batchDeleteCloudflare = (
  id: string | undefined,
  cloudflare: CloudflareApiEndpoint
) =>
  Effect.result(
    id === undefined
      ? Effect.void
      : deleteCloudflareDeployment({...cloudflare, id})
  )

/**
 * Deletes one deployment from Cloudflare and GitHub. Never fails: a failure
 * comes back as a `success: false` row, so the rest still get deleted. The
 * explicit type pins the `never` error channel the `Effect.catch` below gives.
 */
export const batchDelete: (
  deployment: GitHubDeployment,
  deleteComment?: boolean
) => Effect.Effect<
  BatchDeleteItem,
  never,
  CloudflareApi | GitHubApi | PayloadV1Inputs
> = Effect.fn('batchDelete')(
  function* (deployment: GitHubDeployment, deleteComment = true) {
    const decoded = yield* getPayload(deployment.payload)
    const {id, url, fields} = yield* batchDeleteResolve(deployment, decoded)
    const {commentId} = decoded
    const payload = {url, commentId}

    // Delete the Cloudflare deployment first; GitHub's record follows it.
    const deleted = yield* batchDeleteCloudflare(id, decoded.cloudflare)
    if (Result.isFailure(deleted)) {
      // Include the reason, so a failed delete says why.
      error(
        `Cloudflare Error deleting deployment: ${id} - ${deleted.failure.message}`
      )
      return batchDeleteRow(
        deployment,
        {success: false, error: 'Deleting Cloudflare deployment failed'},
        payload
      )
    }

    // Then mark the GitHub deployment inactive and delete it — with its
    // comment, unless another deployment still uses it — in one request.
    const {data, errors} = yield* batchDeleteGitHubRequest(deployment, {
      fields,
      commentId: deleteComment ? commentId : undefined
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
