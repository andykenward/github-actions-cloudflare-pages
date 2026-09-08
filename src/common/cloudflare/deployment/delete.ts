import {error, info, warning} from '@actions/core'

import {cloudflareClient} from '../api/client.js'
import {unwrapSuccess} from '../api/fetch-result.js'
import {ParseError} from '../api/parse-error.js'

/**
 * Cloudflare's "deployment does not exist" code. Treated as success: the
 * deployment may have been deleted manually already.
 *
 * ```json
 * {
 *   "code": 8000009,
 *   "message": "The deployment ID you have specified does not exist. Update the deployment ID and try again. "
 * }
 * ```
 */
const DEPLOYMENT_NOT_FOUND_CODE = 8_000_009

export const deleteCloudflareDeployment = async ({
  id,
  accountId,
  projectName
}: {
  /** deploymentIdentifier */
  id: string
  accountId: string
  projectName: string
}): Promise<boolean> => {
  try {
    const success = unwrapSuccess(
      await cloudflareClient.DELETE(
        '/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}',
        {
          params: {
            path: {
              account_id: accountId,
              project_name: projectName,
              deployment_id: id
            },
            query: {force: true}
          }
        }
      )
    )

    if (success === true) {
      info(`Cloudflare Deployment Deleted: ${id}`)
      return true
    }
    throw new Error('Cloudflare Delete Deployment: fail')
  } catch (successError) {
    if (
      successError instanceof ParseError &&
      successError.code === DEPLOYMENT_NOT_FOUND_CODE
    ) {
      warning(`Cloudflare Deployment might have been deleted already: ${id}`)
      return true
    }
    // Include the reason: previously only the id was logged, so a failed
    // delete gave no indication of why.
    error(
      `Cloudflare Error deleting deployment: ${id} - ${
        successError instanceof Error
          ? successError.message
          : String(successError)
      }`
    )
    return false
  }
}
