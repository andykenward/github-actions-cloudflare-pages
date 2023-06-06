import core from '@actions/core'

import type {FetchError, FetchResult} from '../types.js'
import {ParseError} from './parse-error.js'

/**
 * Source: https://github.com/cloudflare/workers-sdk/blob/55703e52da35b15f5c11f9e3936cc5b1ad5836dc/packages/wrangler/src/cfetch/index.ts#L83-L101
 */
export function throwFetchError(
  resource: string,
  response: FetchResult<unknown>
): never {
  const error = new ParseError({
    text: `A request to the Cloudflare API (${resource}) failed.`,
    notes: response.errors.map(err => ({
      text: renderError(err)
    }))
  })
  // add the first error code directly to this error
  // so consumers can use it for specific behaviour
  const code = response.errors[0]?.code
  if (code) {
    // TODO: Does cloudflare have a schema for their codes?
    //@ts-expect-error non-standard property on Error
    error.code = code
  }
  if (error.notes?.length > 0) {
    error.notes.map(note => {
      // GitHub Action annotation
      core.error(`Cloudflare API: ${note.text}`)
    })
  }
  throw error
}

/**
 * Source: https://github.com/cloudflare/workers-sdk/blob/55703e52da35b15f5c11f9e3936cc5b1ad5836dc/packages/wrangler/src/cfetch/index.ts#L108-L120
 */
function renderError(err: FetchError, level = 0): string {
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
