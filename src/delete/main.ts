import {debug, info, setFailed, warning} from '@unlike/github-actions-core'

import {DeploymentStatusState} from '@/gql/graphql.js'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {deleteCloudflareDeployment} from '@/common/cloudflare/deployment/delete.js'
import {request} from '@/common/github/api/client.js'
import {
  MutationDeleteGitHubDeployment,
  MutationDeleteGitHubDeploymentAndComment
} from '@/common/github/deployment/delete.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'
import {getPayload} from '@/common/github/deployment/payload.js'
import {MutationCreateGitHubDeploymentStatus} from '@/common/github/deployment/status.js'

const PREFIX = `delete -`

const batchDelete = async (
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
  } catch (error) {
    info(`${PREFIX} Deployment payload is not valid : ${JSON.stringify(error)}`)
    return
  }
  /**
   * Add comment with summary of deleted deployments etc?
   */
}

export async function run() {
  const deployments = await getGitHubDeployments()

  if (deployments.length === 0) {
    info(`${PREFIX} No deployments found to delete`)
    return
  }

  try {
    const values = await Promise.all(
      deployments.map(deployment => batchDelete(deployment))
    )
    debug(`${PREFIX} Deleted deployments: ${JSON.stringify(values)}`)
  } catch (error) {
    setFailed(`${PREFIX} Error deleting deployments: ${JSON.stringify(error)}`)
  }
}
