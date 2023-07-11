import {info, warning} from '@unlike/github-actions-core'

import {graphql} from '@/gql/gql.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

import type {
  CreateDeploymentStatusMutation,
  CreateDeploymentStatusMutationVariables,
  DeploymentPayload
} from './github/index.js'
import {getCloudflareLogEndpoint} from './cloudflare/api/endpoints.js'
import {deleteDeployment} from './cloudflare/deployments.js'
import {
  getDeployments,
  MutationCreateDeploymentStatus,
  request,
  useContextEvent
} from './github/index.js'

const idDeploymentPayload = (
  payload:
    | string
    | {
        [key: string]: unknown
      }
): payload is DeploymentPayload => {
  const parsedPayload =
    typeof payload === 'string' ? JSON.parse(payload) : payload
  if (!parsedPayload || typeof parsedPayload !== 'object') return false
  return 'cloudflareId' in parsedPayload && 'url' in parsedPayload
}

const MutationDeleteDeployment = graphql(/* GraphQL */ `
  mutation DeleteDeployment($deploymentId: ID!) {
    deleteDeployment(input: {id: $deploymentId}) {
      clientMutationId
    }
  }
  mutation DeleteIssueComment($commentId: ID!) {
    deleteIssueComment(input: {id: $commentId}) {
      clientMutationId
    }
  }
`)

export const deleteDeployments = async () => {
  /**
   * Check if event is pull_request and is closed
   */
  const {eventName, payload} = useContextEvent()

  if (eventName !== 'pull_request') return
  if (payload.action !== 'closed') return

  const deployments = await getDeployments()

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

    const updateStatusGitHubDeployment = await request<
      CreateDeploymentStatusMutation,
      CreateDeploymentStatusMutationVariables
    >({
      query: MutationCreateDeploymentStatus,
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

    const deletedGitHubDeployment = await request({
      query: MutationDeleteDeployment,
      variables: {
        deploymentId: deployment.node_id,
        commentId: commentId
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
