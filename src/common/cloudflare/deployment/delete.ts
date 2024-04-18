import {error, info, warning} from '@unlike/github-actions-core'

import {getCloudflareApiEndpoint} from '../api/endpoints.js'
import {fetchSuccess} from '../api/fetch-result.js'
import {ParseError} from '../api/parse-error.js'

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
  const url = getCloudflareApiEndpoint({
    path: `deployments/${id}?force=true`,
    accountId,
    projectName
  })

  try {
    const success = await fetchSuccess(url, {
      method: 'DELETE'
    })

    if (success === true) {
      info(`Cloudflare Deployment Deleted: ${id}`)
      return true
    }
    throw new Error('Cloudflare Delete Deployment: fail')
  } catch (successError) {
    if (successError instanceof ParseError && successError.code === 8_000_009) {
      /**
       * The cloudflare deployment might have been deleted manually. So return true.
       * Error response example
       * {
       *   "code": 8000009,
       *   "message": "The deployment ID you have specified does not exist. Update the deployment ID and try again. "
       * }
       */
      warning(`Cloudflare Deployment might have been deleted already: ${id}`)
      return true
    }
    error(`Cloudflare Error deleting deployment: ${id}`)
    return false
  }
}
