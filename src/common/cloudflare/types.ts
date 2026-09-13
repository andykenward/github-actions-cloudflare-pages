import * as Schema from 'effect/Schema'

import type {components} from '@/types/cloudflare/pages.js'

/** One entry of a Cloudflare envelope's `errors`, possibly with a chain. */
export interface FetchError {
  readonly code: number
  readonly message: string
  readonly error_chain?: ReadonlyArray<FetchError> | undefined
}

export const FetchError: Schema.Codec<FetchError> = Schema.Struct({
  code: Schema.Number,
  message: Schema.String,
  error_chain: Schema.optional(
    Schema.Array(Schema.suspend((): Schema.Codec<FetchError> => FetchError))
  )
})

/**
 * The `{success, errors}` envelope every Cloudflare API response carries.
 * `result` only exists on a success body, and only the callers know its type.
 */
export const Envelope = Schema.Struct({
  success: Schema.Boolean,
  errors: Schema.Array(FetchError)
})

export type Envelope = typeof Envelope.Type

export interface FetchResult<ResponseType = unknown> extends Envelope {
  result?: ResponseType | null
  messages?: string[]
  result_info?: unknown
}

/**
 * The type for a Cloudflare Pages Deployment, generated from Cloudflare's
 * canonical OpenAPI schema by `pnpm run codegen:cloudflare`.
 */
export type PagesDeployment = components['schemas']['pages_deployment']
