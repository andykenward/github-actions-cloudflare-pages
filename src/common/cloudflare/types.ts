import type {Deployment} from 'cloudflare/resources/pages/deployments'

export interface FetchError {
  code: number
  message: string
  error_chain?: FetchError[]
}

export interface FetchResult<ResponseType = unknown> {
  success: boolean
  errors: FetchError[]
  result?: ResponseType | null
  messages?: string[]
  result_info?: unknown
}

/**
 * The type for a Cloudflare Pages Deployment.
 */
export type PagesDeployment = Deployment
