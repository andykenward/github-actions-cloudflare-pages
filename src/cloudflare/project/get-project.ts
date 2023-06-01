import type {Project} from '@cloudflare/types'

import {getCloudflareApiEndpoint} from '../api/endpoints'
import {fetchResult} from '../api/fetch-result'

/**
 * Get Cloudfalre Pages project
 * https://developers.cloudflare.com/api/operations/pages-project-get-project
 */
export const getProject = async (): Promise<Project> => {
  const url = getCloudflareApiEndpoint()

  const result = await fetchResult<Project>(url)

  return result
}
