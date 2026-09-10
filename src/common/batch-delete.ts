import {info, warning} from '@actions/core'
import * as Effect from 'effect/Effect'

import {DeploymentStatusState} from '@/gql/graphql.js'

import type {CloudflareApi} from './cloudflare/api/client.js'
import type {GitHubDeployment} from './github/deployment/get.js'
import type {PayloadV1Inputs} from './inputs.js'

import {getCloudflareLogEndpoint} from './cloudflare/api/endpoints.js'
import {deleteCloudflareDeployment} from './cloudflare/deployment/delete.js'
import {errorMessage} from './errors.js'
import {GitHubApi} from './github/api/client.js'
import {
  MutationDeleteGitHubDeployment,
  MutationDeleteGitHubDeploymentAndComment
} from './github/deployment/delete.js'
import {getPayload} from './github/deployment/payload.js'
import {MutationCreateGitHubDeploymentStatus} from './github/deployment/status.js'

const PREFIX = `delete -`

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

    /**
     * Delete Cloudflare deployment
     */
    const deletedCloudflareDeployment =
      yield* deleteCloudflareDeployment(cloudflare)

    if (!deletedCloudflareDeployment)
      return {
        success: false,
        error: 'Deleting Cloudflare deployment failed',
        environment: deployment.environment,
        environmentUrl: url,
        deploymentId: deployment.node_id,
        commentId
      }
    /**
     * On success of Cloudflare deployment delete GitHub deployment & comment.
     */
    const github = yield* GitHubApi

    const updateStatusGitHubDeployment = yield* github.request({
      query: MutationCreateGitHubDeploymentStatus,
      variables: {
        environment: deployment.environment,
        deploymentId: deployment.node_id,
        environmentUrl: url,
        logUrl: getCloudflareLogEndpoint(cloudflare),
        state: DeploymentStatusState.Inactive
      },
      options: {
        errorThrows: false
      }
    })

    if (updateStatusGitHubDeployment.errors) {
      warning(
        `${PREFIX} Error updating GitHub deployment status: ${JSON.stringify(
          updateStatusGitHubDeployment.errors
        )}`
      )
      return {
        success: false,
        error: 'Updating GitHub deployment status failed',
        environment: deployment.environment,
        environmentUrl: url,
        deploymentId: deployment.node_id,
        commentId
      }
    }

    const deletedGitHubDeployment = commentId
      ? yield* github.request({
          query: MutationDeleteGitHubDeploymentAndComment,
          variables: {
            deploymentId: deployment.node_id,
            commentId: commentId
          },
          options: {
            errorThrows: false
          }
        })
      : yield* github.request({
          query: MutationDeleteGitHubDeployment,
          variables: {
            deploymentId: deployment.node_id
          },
          options: {
            errorThrows: false
          }
        })

    if (deletedGitHubDeployment.errors) {
      warning(
        `${PREFIX} Error deleting GitHub deployment: ${JSON.stringify(
          deletedGitHubDeployment.errors
        )}`
      )
    }
    info(`${PREFIX} GitHub Deployment Deleted: ${deployment.node_id}`)

    return {
      success: true,
      environment: deployment.environment,
      environmentUrl: url,
      deploymentId: deployment.node_id,
      commentId
    }
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
