import {info, warning} from '@unlike/github-actions-core'

import {DeploymentStatusState} from '@/gql/graphql.js'

import type {getGitHubDeployments} from './github/deployment/get.js'

import {getCloudflareLogEndpoint} from './cloudflare/api/endpoints.js'
import {deleteCloudflareDeployment} from './cloudflare/deployment/delete.js'
import {request} from './github/api/client.js'
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

export const batchDelete = async (
  deployment: Awaited<ReturnType<typeof getGitHubDeployments>>[number]
): Promise<BatchDeleteItem> => {
  const payload = deployment.payload

  try {
    const {commentId, url, cloudflare} = getPayload(payload)

    /**
     * Delete Cloudflare deployment
     */
    const deletedCloudflareDeployment =
      await deleteCloudflareDeployment(cloudflare)

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

    const updateStatusGitHubDeployment = await request({
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
      ? await request({
          query: MutationDeleteGitHubDeploymentAndComment,
          variables: {
            deploymentId: deployment.node_id,
            commentId: commentId
          },
          options: {
            errorThrows: false
          }
        })
      : await request({
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
  } catch (error) {
    info(`${PREFIX} Deployment payload is not valid : ${JSON.stringify(error)}`)

    return {
      success: false,
      error: JSON.stringify(error),
      environment: deployment.environment,
      deploymentId: deployment.node_id
    }
  }
}
