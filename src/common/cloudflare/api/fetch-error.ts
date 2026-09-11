import type {FetchError, FetchResult} from '../types.js'

import {ParseError} from './parse-error.js'

/**
 * Source: https://github.com/cloudflare/workers-sdk/blob/55703e52da35b15f5c11f9e3936cc5b1ad5836dc/packages/wrangler/src/cfetch/index.ts#L83-L101
 */
export const throwFetchError = (
  resource: string,
  response: FetchResult<unknown>
): never => {
  const notes = response.errors.map(err => ({text: renderError(err)}))
  const error = new ParseError({
    // Cloudflare's reasons go in the message, which is what reaches the step's
    // failure annotation or the caller's log line. They aren't annotated here:
    // a caller may tolerate the error (delete treats "not found" as deleted).
    text: [
      `A request to the Cloudflare API (${resource}) failed.`,
      ...notes.map(note => note.text)
    ].join(' '),
    notes
  })
  const code = response.errors[0]?.code
  if (code) {
    error.code = code
  }
  throw error
}

/**
 * Source: https://github.com/cloudflare/workers-sdk/blob/55703e52da35b15f5c11f9e3936cc5b1ad5836dc/packages/wrangler/src/cfetch/index.ts#L108-L120
 */
const renderError = (err: FetchError, level = 0): string => {
  const chainedMessages =
    err.error_chain
      ?.map(
        chainedError =>
          `\n${'  '.repeat(level)}- ${renderError(chainedError, level + 1)}`
      )
      .join('\n') ?? ''
  return (
    (err.code ? `${err.message} [code: ${err.code}]` : err.message) +
    chainedMessages
  )
}
