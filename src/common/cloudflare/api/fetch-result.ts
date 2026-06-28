import type {FetchError, FetchResult} from '../types.js'

import {throwFetchError} from './fetch-error.js'

/**
 * The Cloudflare response envelope as returned by the typed client. `data` is
 * populated on 2xx, `error` on non-2xx; both carry the `{success, errors}`
 * envelope. `result` only exists on the success body.
 */
interface ClientResponse<Result> {
  data?: {success: boolean; errors: FetchError[]; result?: Result | null}
  error?: {success: boolean; errors: FetchError[]}
  response: Response
}

/**
 * Unwrap a Cloudflare response, returning the typed `result` or throwing.
 *
 * Replaces the previous string-URL `fetchResult<T>()` — the request itself is
 * now made by the typed [`cloudflareClient`](./client.ts); this only applies the
 * Cloudflare-specific envelope semantics openapi-fetch has no concept of.
 */
export const unwrap = <Result>({
  data,
  error,
  response
}: ClientResponse<Result>): Result => {
  // Non-2xx: the envelope arrives on `error`.
  if (error) {
    return throwFetchError(response.url, error as FetchResult<unknown>)
  }
  // 2xx but the API still reports failure.
  if (!data?.success) {
    return throwFetchError(
      response.url,
      (data ?? {success: false, errors: []}) as FetchResult<unknown>
    )
  }
  if (data.result === null || data.result === undefined) {
    throw new Error(`Cloudflare API: response missing 'result'`)
  }
  return data.result
}

/**
 * Unwrap a Cloudflare response that has no meaningful `result` (e.g. DELETE),
 * returning the `success` boolean. Throws via `throwFetchError` when the API
 * reports errors. Replaces the previous `fetchSuccess()`.
 */
export const unwrapSuccess = ({
  data,
  error,
  response
}: ClientResponse<unknown>): boolean => {
  const envelope = data ?? error
  if (envelope && !envelope.success && envelope.errors.length > 0) {
    throwFetchError(response.url, envelope as FetchResult<unknown>)
  }
  return envelope?.success ?? false
}
