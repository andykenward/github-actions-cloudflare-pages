import type {Project} from '@cloudflare/types'

import {getCloudflareApiEndpoint} from './endpoints'
import {fetchResult} from './utils'

/** Get Cloudflare Pages project */
export const getProject = async (): Promise<Project> => {
  const url = getCloudflareApiEndpoint()

  const result = await fetchResult<Project>(url)

  return result
}
