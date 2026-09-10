import {info, warning} from '@actions/core'
import * as Effect from 'effect/Effect'

import type {CloudflareApi} from './cloudflare/api/client.js'
import type {GitHubDeployment} from './github/deployment/get.js'
import type {PayloadV1Inputs} from './inputs.js'

import {getCloudflareLogEndpoint} from './cloudflare/api/endpoints.js'
import {deleteCloudflareDeployment} from './cloudflare/deployment/delete.js'
import {errorMessage} from './errors.js'
import {GitHubApi} from './github/api/client.js'
import {
  MutationDeactivateAndDeleteGitHubDeployment,
  MutationDeactivateAndDeleteGitHubDeploymentAndComment
} from './github/deployment/delete.js'
import {getPayload} from './github/deployment/payload.js'

/** Log prefix for the delete action. */
export const PREFIX = `delete -`

type BatchDeleteItem = {
  deploymentId: string
  success: boolean
  environment: string
  environmentUrl?: string
  commentId?: string
  error?: string
}

/**
 * Deletes one deployment from Cloudflare and GitHub. Never fails: a failure
 * comes back as a `success: false` row, so the rest still get deleted.
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

    const row = (
      outcome: {success: true} | {success: false; error: string}
    ): BatchDeleteItem => ({
      deploymentId: deployment.node_id,
      environment: deployment.environment,
      environmentUrl: url,
      commentId,
      ...outcome
    })

    /**
     * Delete Cloudflare deployment
     */
    const deletedCloudflareDeployment =
      yield* deleteCloudflareDeployment(cloudflare)

    if (!deletedCloudflareDeployment) {
      return row({
        success: false,
        error: 'Deleting Cloudflare deployment failed'
      })
    }

    /**
     * On success of Cloudflare deployment, mark the GitHub deployment inactive
     * and delete it (with its comment) — one request.
     */
    const github = yield* GitHubApi

    const variables = {
      deploymentId: deployment.node_id,
      environment: deployment.environment,
      environmentUrl: url,
      logUrl: getCloudflareLogEndpoint(cloudflare)
    }

    const {errors} = commentId
      ? yield* github.request({
          query: MutationDeactivateAndDeleteGitHubDeploymentAndComment,
          variables: {...variables, commentId},
          options: {errorThrows: false}
        })
      : yield* github.request({
          query: MutationDeactivateAndDeleteGitHubDeployment,
          variables,
          options: {errorThrows: false}
        })

    if (errors?.some(error => error.path?.[0] === 'createDeploymentStatus')) {
      warning(
        `${PREFIX} Error updating GitHub deployment status: ${JSON.stringify(errors)}`
      )
      return row({
        success: false,
        error: 'Updating GitHub deployment status failed'
      })
    }

    if (errors) {
      warning(
        `${PREFIX} Error deleting GitHub deployment: ${JSON.stringify(errors)}`
      )
    }
    info(`${PREFIX} GitHub Deployment Deleted: ${deployment.node_id}`)

    return row({success: true})
  },
  (effect, deployment) =>
    Effect.catch(effect, failure => {
      // Any failure lands here — an invalid payload, but also network and API
      // errors — so name the deployment rather than blaming the payload.
      const message = errorMessage(failure)
      warning(
        `${PREFIX} Error deleting deployment ${deployment.node_id}: ${message}`
      )

      return Effect.succeed({
        success: false,
        error: message,
        environment: deployment.environment,
        deploymentId: deployment.node_id
      })
    })
)
