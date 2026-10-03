import type * as HttpClientResponse from 'effect/http/HttpClientResponse'

import {STATUS_CODES} from 'node:http'

import * as Effect from 'effect/Effect'
import * as HttpClientError from 'effect/http/HttpClientError'
import * as Result from 'effect/Result'
import * as Schema from 'effect/Schema'

import type {CloudflarePagesError} from '@/types/cloudflare/pages.js'

import {Envelope} from '../types.js'
import {
  ApiErrors,
  CloudflareApiError,
  HttpError,
  MissingResult,
  RequestError
} from './error.js'

/**
 * The generated client casts a body to the operation's type without decoding
 * it, so the envelope is checked rather than trusted.
 */
const isEnvelope = Schema.is(Envelope)

/**
 * A 2xx response from the generated client, called with `WITH_RESPONSE`: the
 * JSON body, then the response it came with. `result` only exists on a
 * success body.
 */
export type ClientResponse<Result> = readonly [
  body: {readonly result?: Result | null},
  response: HttpClientResponse.HttpClientResponse
]

/**
 * What a generated operation fails with: `CloudflarePagesError` for a 4xx
 * with a JSON body, `HttpClientError` for everything else.
 */
export type OperationError =
  | HttpClientError.HttpClientError
  | CloudflarePagesError<string, unknown>

const fail = (
  reason: CloudflareApiError['reason']
): Result.Result<never, CloudflareApiError> =>
  Result.fail(CloudflareApiError.from(reason))

/** The response's URL: where a redirect ended, else where the request went. */
const responseUrl = (response: HttpClientResponse.HttpClientResponse): string =>
  response.url || response.request.url

/** A response whose body is no envelope, e.g. an HTML 502 from the edge. */
const httpError = (
  response: HttpClientResponse.HttpClientResponse
): HttpError =>
  new HttpError({
    url: responseUrl(response),
    status: response.status,
    // `effect/http` doesn't carry the reason phrase; Node knows the standard one.
    statusText: STATUS_CODES[response.status] ?? ''
  })

/** Why a non-2xx response failed: its envelope's errors, or just its status. */
const errorReason = (
  response: HttpClientResponse.HttpClientResponse,
  body: unknown
): ApiErrors | HttpError =>
  isEnvelope(body)
    ? new ApiErrors({url: responseUrl(response), errors: body.errors})
    : httpError(response)

/**
 * The envelope of a 2xx response, or the reason it has none that reports
 * success: a body that is no envelope, or one that still says `success: false`.
 */
const envelope = ([body, response]: ClientResponse<unknown>): Result.Result<
  Envelope,
  CloudflareApiError
> => {
  if (!isEnvelope(body)) {
    return fail(httpError(response))
  }
  if (!body.success) {
    return fail(
      new ApiErrors({url: responseUrl(response), errors: body.errors})
    )
  }
  return Result.succeed(body)
}

/** The typed `result` of a successful response. */
export const unwrap = <R>(
  clientResponse: ClientResponse<R>
): Result.Result<R, CloudflareApiError> =>
  envelope(clientResponse).pipe(
    Result.flatMap(() => {
      const [{result}, response] = clientResponse
      return result === null || result === undefined
        ? fail(new MissingResult({url: responseUrl(response)}))
        : Result.succeed(result)
    })
  )

/** For a request with no meaningful `result` (e.g. DELETE): success or why not. */
export const unwrapSuccess = (
  clientResponse: ClientResponse<unknown>
): Result.Result<void, CloudflareApiError> =>
  envelope(clientResponse).pipe(Result.map(() => void 0))

/**
 * Fails with the `CloudflareApiError` for what a generated operation failed
 * with: the envelope's errors when the response carried one, its status when
 * it didn't, or the transport's cause when there was no response at all.
 */
export const operationFailure = Effect.fnUntraced(function* (
  error: OperationError
): Effect.fn.Return<never, CloudflareApiError> {
  // A 4xx whose body the client already parsed.
  if (!HttpClientError.isHttpClientError(error)) {
    return yield* CloudflareApiError.from(
      errorReason(error.response, error.cause)
    )
  }
  const {response} = error
  // The request never got a response: a network error, or an aborted fetch.
  if (response === undefined) {
    return yield* CloudflareApiError.from(
      new RequestError({cause: error.reason.cause ?? error})
    )
  }
  // Any other status, or a body that didn't parse. The body is cached, so
  // reading it again costs nothing; one that isn't JSON is the `HttpError`
  // case itself, not a failure to report.
  const body: unknown = yield* response.json.pipe(
    Effect.catchTag('HttpClientError', () => Effect.void)
  )
  return yield* CloudflareApiError.from(errorReason(response, body))
})
