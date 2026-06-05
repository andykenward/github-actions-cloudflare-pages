import {error, info, warning} from '@actions/core'
import Cloudflare from 'cloudflare'

import type {FetchResult} from '../types.js'

import {getCloudflareClient} from '../api/client.js'

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
  const client = getCloudflareClient()

  try {
    await client.pages.projects.deployments.delete(id, {
      account_id: accountId,
      project_name: projectName,
      force: true
    })
    info(`Cloudflare Deployment Deleted: ${id}`)
    return true
  } catch (deleteError) {
    if (deleteError instanceof Cloudflare.APIError) {
      const body = deleteError.error as FetchResult | undefined
      if (body?.errors[0]?.code === 8_000_009) {
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
    }
    error(`Cloudflare Error deleting deployment: ${id}`)
    return false
  }
}
