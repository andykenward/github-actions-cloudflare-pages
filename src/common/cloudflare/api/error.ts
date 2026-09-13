import * as Schema from 'effect/Schema'

import {errorMessage} from '@/common/errors.js'

import {FetchError} from '../types.js'

/**
 * Renders one Cloudflare error with its chain beneath it, indented by depth.
 * Source: https://github.com/cloudflare/workers-sdk/blob/55703e52da35b15f5c11f9e3936cc5b1ad5836dc/packages/wrangler/src/cfetch/index.ts#L108-L120
 */
const renderError = (error: FetchError, level = 0): string => {
  const chainedMessages =
    error.error_chain
      ?.map(
        chainedError =>
          `\n${'  '.repeat(level)}- ${renderError(chainedError, level + 1)}`
      )
      .join('\n') ?? ''
  return (
    (error.code ? `${error.message} [code: ${error.code}]` : error.message) +
    chainedMessages
  )
}

const failed = (url: string): string =>
  `A request to the Cloudflare API (${url}) failed`

/**
 * Cloudflare answered with an envelope reporting failure. `code` is the first
 * error's, the one Cloudflare's docs key on (e.g. `8000009`, not found).
 */
// oxlint-disable-next-line unicorn/throw-new-error
export class ApiErrors extends Schema.TaggedError<ApiErrors>()('ApiErrors', {
  url: Schema.String,
  errors: Schema.Array(FetchError)
}) {
  get code(): number | undefined {
    return this.errors[0]?.code
  }
}

/** A non-2xx response without an envelope, e.g. an HTML 502 from the edge. */
// oxlint-disable-next-line unicorn/throw-new-error
export class HttpError extends Schema.TaggedError<HttpError>()('HttpError', {
  url: Schema.String,
  status: Schema.Number,
  statusText: Schema.String
}) {}

/** A 2xx envelope without the `result` the caller needs. */
// oxlint-disable-next-line unicorn/throw-new-error
export class MissingResult extends Schema.TaggedError<MissingResult>()(
  'MissingResult',
  {url: Schema.String}
) {}

/** The request itself failed: a network error, or an aborted fetch. */
// oxlint-disable-next-line unicorn/throw-new-error
export class RequestError extends Schema.TaggedError<RequestError>()(
  'RequestError',
  {cause: Schema.Defect()}
) {}

const reasonMessage = (
  reason: ApiErrors | HttpError | MissingResult | RequestError
): string => {
  switch (reason._tag) {
    case 'ApiErrors': {
      // Cloudflare's reasons go in the message, which is what reaches the
      // step's failure annotation or the caller's log line.
      return [`${failed(reason.url)}.`, ...reason.errors.map(renderError)]
        .join(' ')
        .trimEnd()
    }
    case 'HttpError': {
      return `${failed(reason.url)}: ${reason.status} ${reason.statusText}`.trimEnd()
    }
    case 'MissingResult': {
      return `${failed(reason.url)}: response missing 'result'`
    }
    case 'RequestError': {
      return errorMessage(reason.cause)
    }
  }
}

/**
 * A failed Cloudflare request. `reason` says why, so a caller can tolerate
 * one outcome — `Effect.catchReason(…, 'ApiErrors', …)` — without inspecting
 * the message. Nothing is annotated here: the caller reports the failure.
 */
// oxlint-disable-next-line unicorn/throw-new-error
export class CloudflareApiError extends Schema.TaggedError<CloudflareApiError>()(
  'CloudflareApiError',
  {
    message: Schema.String,
    reason: Schema.Union([ApiErrors, HttpError, MissingResult, RequestError])
  }
) {
  static readonly from = (
    reason: CloudflareApiError['reason']
  ): CloudflareApiError =>
    new CloudflareApiError({message: reasonMessage(reason), reason})
}
