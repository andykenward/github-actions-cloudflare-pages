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

export const batchDelete = async (
  deployment: Awaited<ReturnType<typeof getGitHubDeployments>>[number]
) => {
  const payload = deployment.payload

  try {
    const {commentId, url, cloudflare} = getPayload(payload)

    /**
     * Delete Cloudflare deployment
     */
    const deletedCloudflareDeployment =
      await deleteCloudflareDeployment(cloudflare)
    if (!deletedCloudflareDeployment) return
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
      return
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

    // TODO: return meaningful value to log and use in summary;
  } catch (error) {
    info(`${PREFIX} Deployment payload is not valid : ${JSON.stringify(error)}`)
    // TODO: return meaningful value to log and use in summary;
    return
  }
  /**
   * Add comment with summary of deleted deployments etc?
   */
}
