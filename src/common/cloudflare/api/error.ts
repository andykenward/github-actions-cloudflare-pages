import assert from 'node:assert/strict'

import * as Schema from 'effect/Schema'

import {errorMessage} from '@/common/errors.js'

import {FetchError} from '../types.js'

/**
 * The most errors of one chain that are rendered. Cloudflare's chains are a
 * few deep; the bound is for a response that isn't, since `error_chain` is
 * external data of unbounded depth.
 */
const ERROR_CHAIN_NODE_COUNT_MAX = 64

const errorHead = (error: FetchError): string =>
  error.code ? `${error.message} [code: ${error.code}]` : error.message

type ChainNode = {error: FetchError; depth: number; isFirstSibling: boolean}

/**
 * Renders one Cloudflare error with its chain beneath it, indented by depth,
 * walking the chain with an explicit stack rather than recursing into it.
 * Siblings after the first are separated by a blank line.
 * Source: https://github.com/cloudflare/workers-sdk/blob/55703e52da35b15f5c11f9e3936cc5b1ad5836dc/packages/wrangler/src/cfetch/index.ts#L108-L120
 */
const renderError = (root: FetchError): string => {
  let rendered = errorHead(root)
  const stack: Array<ChainNode> = []
  const pushChain = (error: FetchError, depth: number): void => {
    const chain = error.error_chain ?? []
    // Pushed in reverse, so the first sibling is rendered first.
    for (let index = chain.length - 1; index >= 0; index--) {
      const chained = chain[index]
      if (chained !== undefined) {
        stack.push({error: chained, depth, isFirstSibling: index === 0})
      }
    }
  }
  pushChain(root, 1)

  let count = 1
  for (let node = stack.pop(); node !== undefined; node = stack.pop()) {
    if (count >= ERROR_CHAIN_NODE_COUNT_MAX) {
      return `${rendered}\n- … (more errors omitted)`
    }
    count++
    const separator = node.isFirstSibling ? '\n' : '\n\n'
    rendered += `${separator}${'  '.repeat(node.depth - 1)}- ${errorHead(node.error)}`
    pushChain(node.error, node.depth + 1)
  }
  return rendered
}

const requestFailedMessage = (url: string): string =>
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
      return [
        `${requestFailedMessage(reason.url)}.`,
        ...reason.errors.map(renderError)
      ]
        .join(' ')
        .trimEnd()
    }
    case 'HttpError': {
      return `${requestFailedMessage(reason.url)}: ${reason.status} ${reason.statusText}`.trimEnd()
    }
    case 'MissingResult': {
      return `${requestFailedMessage(reason.url)}: response missing 'result'`
    }
    case 'RequestError': {
      return errorMessage(reason.cause)
    }
    default: {
      return assert.fail(
        `unknown Cloudflare error reason ${JSON.stringify(reason)}`
      )
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
