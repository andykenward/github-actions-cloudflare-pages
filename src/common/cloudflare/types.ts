import type {Deployment} from '@cloudflare/types'

export interface FetchError {
  code: number
  message: string
  error_chain?: FetchError[]
}

export interface FetchNoResult {
  success: boolean
  errors: FetchError[]
}

export interface FetchResult<ResponseType = unknown> extends FetchNoResult {
  result?: ResponseType | null
  messages?: string[]
  result_info?: unknown
}

/**
 * The type for a Cloudflare Pages Deployment.
 *
 */
export type PagesDeployment = Omit<Deployment, 'aliases'> & {
  /**
   * The aliases property type is incorrect from '@cloudflare/types'.
   * It could be null.
   */
  aliases: string[] | null
}
