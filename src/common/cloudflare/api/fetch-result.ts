import * as Result from 'effect/Result'
import * as Schema from 'effect/Schema'

import {Envelope} from '../types.js'
import {
  ApiErrors,
  CloudflareApiError,
  HttpError,
  MissingResult
} from './error.js'

/**
 * openapi-fetch hands back a body that isn't JSON — e.g. an HTML 502 from
 * Cloudflare's edge — as a string, whatever the declared type says, so the
 * envelope is checked rather than trusted.
 */
const isEnvelope = Schema.is(Envelope)

/**
 * A Cloudflare response as returned by the typed client. `data` is populated
 * on 2xx, `error` on non-2xx; both carry the `{success, errors}` envelope.
 * `result` only exists on the success body.
 */
export interface ClientResponse<Result> {
  data?: Envelope & {result?: Result | null}
  error?: Envelope
  response: Response
}

const fail = (
  reason: CloudflareApiError['reason']
): Result.Result<never, CloudflareApiError> =>
  Result.fail(CloudflareApiError.from(reason))

/**
 * The envelope of a response, or the reason it has none that reports
 * success: a non-2xx status, or a 2xx body that still says `success: false`.
 */
const envelope = ({
  data,
  error,
  response
}: ClientResponse<unknown>): Result.Result<Envelope, CloudflareApiError> => {
  const {url, status, statusText} = response
  if (!response.ok) {
    return isEnvelope(error)
      ? fail(new ApiErrors({url, errors: error.errors}))
      : fail(new HttpError({url, status, statusText}))
  }
  if (!isEnvelope(data)) {
    return fail(new HttpError({url, status, statusText}))
  }
  if (!data.success) {
    return fail(new ApiErrors({url, errors: data.errors}))
  }
  return Result.succeed(data)
}

/** The typed `result` of a successful response. */
export const unwrap = <R>(
  clientResponse: ClientResponse<R>
): Result.Result<R, CloudflareApiError> =>
  envelope(clientResponse).pipe(
    Result.flatMap(() => {
      const result = clientResponse.data?.result
      return result === null || result === undefined
        ? fail(new MissingResult({url: clientResponse.response.url}))
        : Result.succeed(result)
    })
  )

/** For a request with no meaningful `result` (e.g. DELETE): success or why not. */
export const unwrapSuccess = (
  clientResponse: ClientResponse<unknown>
): Result.Result<void, CloudflareApiError> =>
  envelope(clientResponse).pipe(Result.map(() => void 0))
