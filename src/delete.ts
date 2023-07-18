import {info, warning} from '@unlike/github-actions-core'

import {DeploymentStatusState} from '@/gql/graphql.js'

import type {PayloadGithubDeployment} from './github/index.js'
import {getCloudflareLogEndpoint} from './cloudflare/api/endpoints.js'
import {deleteDeployment} from './cloudflare/deployments.js'
import {
  getGitHubDeployments,
  MutationCreateGitHubDeploymentStatus,
  MutationDeleteGitHubDeployment,
  MutationDeleteGitHubDeploymentAndComment,
  request
} from './github/index.js'

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
    const deletedCloudflareDeployment = await deleteDeployment(cloudflareId)
    if (!deletedCloudflareDeployment) continue
    info(`Cloudflare Deployment Deleted: ${cloudflareId}`)
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
