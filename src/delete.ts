import {info, warning} from '@unlike/github-actions-core'

import {DeploymentStatusState} from '@/gql/graphql.js'

import type {PayloadGithubDeployment} from './github/deployment/types.js'

import {getCloudflareLogEndpoint} from './cloudflare/api/endpoints.js'
import {deleteCloudflareDeployment} from './cloudflare/deployment/delete.js'
import {request} from './github/api/client.js'
import {
  MutationDeleteGitHubDeployment,
  MutationDeleteGitHubDeploymentAndComment
} from './github/deployment/delete.js'
import {getGitHubDeployments} from './github/deployment/get.js'
import {MutationCreateGitHubDeploymentStatus} from './github/deployment/status.js'

const idDeploymentPayload = (
  payload:
    | string
    | {
        [key: string]: unknown
      }
): payload is PayloadGithubDeployment => {
  const parsedPayload =
    typeof payload === 'string' ? JSON.parse(payload) : payload
  if (!parsedPayload || typeof parsedPayload !== 'object') return false
  return 'cloudflareId' in parsedPayload && 'url' in parsedPayload
}

export const deleteDeployments = async (isProduction = false) => {
  let deployments = await getGitHubDeployments()

  if (isProduction) {
    // Remove first 5 deployments
    deployments = deployments.slice(5)
  }

  if (deployments.length === 0) {
    info('No deployments found to delete')
    return
  }
  for (const deployment of deployments) {
    const payload = deployment.payload

    if (!idDeploymentPayload(payload)) {
      info(`Deployment ${deployment.id} has no payload`)
      continue
    }

    const {cloudflareId, commentId, url} = payload

    /**
     * Delete Cloudflare deployment
     */
    const deletedCloudflareDeployment =
      await deleteCloudflareDeployment(cloudflareId)
    if (!deletedCloudflareDeployment) continue
    /**
     * On success of Cloudflare deployment delete GitHub deployment & and comment.
     */

    const updateStatusGitHubDeployment = await request({
      query: MutationCreateGitHubDeploymentStatus,
      variables: {
        environment: deployment.environment,
        deploymentId: deployment.node_id,
        environmentUrl: url,
        logUrl: getCloudflareLogEndpoint(cloudflareId),
        state: DeploymentStatusState.Inactive
      },
      options: {
        errorThrows: false
      }
    })

    if (updateStatusGitHubDeployment.errors) {
      warning(
        `Error updating GitHub deployment status: ${JSON.stringify(
          updateStatusGitHubDeployment.errors
        )}`
      )
      continue
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
        `Error deleting GitHub deployment: ${JSON.stringify(
          deletedGitHubDeployment.errors
        )}`
      )
    }
    info(`GitHub Deployment Deleted: ${deployment.node_id}`)
    /**
     * Add comment with summary of deleted deployments etc?
     */
  }
}
