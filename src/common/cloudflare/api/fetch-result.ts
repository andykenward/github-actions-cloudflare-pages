import * as Predicate from 'effect/Predicate'

import type {FetchError} from '../types.js'

import {throwFetchError} from './fetch-error.js'
import {ParseError} from './parse-error.js'

type Envelope = {success: boolean; errors: FetchError[]}

/**
 * openapi-fetch hands back a body that isn't JSON — e.g. an HTML 502 from
 * Cloudflare's edge — as a string, whatever the declared type says.
 */
const isEnvelope = (body: unknown): body is Envelope =>
  Predicate.isObject(body) && Array.isArray(body['errors'])

/** A non-2xx response without an envelope: all there is to report is the status. */
const throwStatusError = ({url, status, statusText}: Response): never => {
  throw new ParseError({
    text: `A request to the Cloudflare API (${url}) failed: ${status} ${statusText}`.trimEnd()
  })
}

/**
 * The Cloudflare response envelope as returned by the typed client. `data` is
 * populated on 2xx, `error` on non-2xx; both carry the `{success, errors}`
 * envelope. `result` only exists on the success body.
 */
export interface ClientResponse<Result> {
  data?: {success: boolean; errors: FetchError[]; result?: Result | null}
  error?: {success: boolean; errors: FetchError[]}
  response: Response
}

/**
 * Unwrap a Cloudflare response, returning the typed `result` or throwing.
 *
 * Replaces the previous string-URL `fetchResult<T>()` — the request itself is
 * now made by [`CloudflareApi`](./client.ts), which calls this; it only applies
 * the Cloudflare-specific envelope semantics openapi-fetch has no concept of.
 */
export const unwrap = <Result>({
  data,
  error,
  response
}: ClientResponse<Result>): Result => {
  // Non-2xx: the envelope arrives on `error`.
  if (!response.ok) {
    return isEnvelope(error)
      ? throwFetchError(response.url, error)
      : throwStatusError(response)
  }
  // 2xx but the API still reports failure.
  if (!data?.success) {
    return throwFetchError(response.url, data ?? {success: false, errors: []})
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
  if (!response.ok && !isEnvelope(error)) {
    return throwStatusError(response)
  }
  const envelope = data ?? error
  if (envelope && !envelope.success && envelope.errors.length > 0) {
    throwFetchError(response.url, envelope)
  }
  return envelope?.success ?? false
}
