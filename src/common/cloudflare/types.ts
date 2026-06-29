import type {components} from '@/types/cloudflare/pages.js'

export interface FetchError {
  code: number
  message: string
  error_chain?: FetchError[]
}

interface FetchNoResult {
  success: boolean
  errors: FetchError[]
}

export interface FetchResult<ResponseType = unknown> extends FetchNoResult {
  result?: ResponseType | null
  messages?: string[]
  result_info?: unknown
}

/**
 * The type for a Cloudflare Pages Deployment, generated from Cloudflare's
 * canonical OpenAPI schema by `pnpm run codegen:cloudflare`.
 */
export type PagesDeployment = components['schemas']['pages_deployment']
