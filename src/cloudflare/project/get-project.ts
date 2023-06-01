import type {Project} from '@cloudflare/types'

import {getCloudflareApiEndpoint} from '../api/endpoints.js'
import {fetchResult} from '../api/fetch-result.js'

/**
 * Get Cloudfalre Pages project
 * https://developers.cloudflare.com/api/operations/pages-project-get-project
 */
export const getProject = async (): Promise<Project> => {
  const url = getCloudflareApiEndpoint()

  const result = await fetchResult<Project>(url)

  return result
}
