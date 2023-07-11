import {info, warning} from '@unlike/github-actions-core'

import {graphql} from '@/gql/gql.js'

import type {DeploymentPayload} from './github/index.js'
import {deleteDeployment} from './cloudflare/deployments.js'
import {getDeployments, request, useContextEvent} from './github/index.js'

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

    const {cloudflareId, commentId} = payload

    /**
     * Delete Cloudflare deployment
     */
    const deletedCloudflareDeployment = await deleteDeployment(cloudflareId)
    if (!deletedCloudflareDeployment) continue
    /**
     * On success of Cloudflare deployment delete GitHub deployment & and comment.
     */

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
    /**
     * Add comment with summary of deleted deployments etc?
     */
  }
}
