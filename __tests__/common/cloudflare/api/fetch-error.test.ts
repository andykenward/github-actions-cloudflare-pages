import * as core from '@actions/core'
import {describe, expect, test, vi} from 'vitest'

import type {FetchResult} from '@/common/cloudflare/types.js'

import {throwFetchError} from '@/common/cloudflare/api/fetch-error.js'
import {ParseError} from '@/common/cloudflare/api/parse-error.js'

const RESOURCE_URL = `https://api.cloudflare.com/path`

vi.mock(import('@actions/core'))

describe(throwFetchError, () => {
  test('puts the notes in the message without annotating them', () => {
    expect.assertions(2)

    const ERRORS = {
      success: false,
      errors: [
        {
          code: 10000,
          message: 'Authentication error'
        }
      ]
    } satisfies FetchResult

    expect(() =>
      throwFetchError(RESOURCE_URL, ERRORS)
    ).toThrowErrorMatchingInlineSnapshot(
      `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/path) failed. Authentication error [code: 10000]]`
    )

    // A caller may tolerate the error, so reporting it is the caller's job.
    expect(core.error).not.toHaveBeenCalled()
  })

  test('puts every note in the message', () => {
    expect.assertions(1)

    const ERRORS = {
      success: false,
      errors: [
        {
          code: 10000,
          message: 'Authentication error'
        },
        {
          code: 20000,
          message: 'Another error'
        }
      ]
    } satisfies FetchResult

    expect(() =>
      throwFetchError(RESOURCE_URL, ERRORS)
    ).toThrowErrorMatchingInlineSnapshot(
      `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/path) failed. Authentication error [code: 10000] Another error [code: 20000]]`
    )
  })

  test('takes the code from the first error', () => {
    expect.assertions(1)

    const ERRORS = {
      success: false,
      errors: [
        {
          code: 8000009,
          message: 'The deployment ID you have specified does not exist.'
        },
        {
          code: 10000,
          message: 'Authentication error'
        }
      ]
    } satisfies FetchResult

    expect(() => throwFetchError(RESOURCE_URL, ERRORS)).toThrow(
      expect.objectContaining({code: 8000009})
    )
  })

  test('renders each chained error beneath its parent, indented by depth', () => {
    expect.assertions(2)

    const ERRORS = {
      success: false,
      errors: [
        {
          code: 8000000,
          message: 'Deployment failed',
          error_chain: [
            {
              code: 8000001,
              message: 'Build failed',
              error_chain: [{code: 8000002, message: 'Out of memory'}]
            },
            {code: 8000003, message: 'Upload failed'}
          ]
        }
      ]
    } satisfies FetchResult

    expect(() => throwFetchError(RESOURCE_URL, ERRORS)).toThrow(ParseError)
    expect(() => throwFetchError(RESOURCE_URL, ERRORS)).toThrow(
      `A request to the Cloudflare API (${RESOURCE_URL}) failed. Deployment failed [code: 8000000]
- Build failed [code: 8000001]
  - Out of memory [code: 8000002]

- Upload failed [code: 8000003]`
    )
  })

  test('throws without a code or annotation when there are no errors', () => {
    expect.assertions(3)

    expect(() =>
      throwFetchError(RESOURCE_URL, {success: false, errors: []})
    ).toThrow(expect.objectContaining({code: undefined, notes: []}))
    expect(core.error).not.toHaveBeenCalled()
    // `throwFetchError` always passes notes, so construct one to cover the
    // defaults.
    expect(new ParseError({text: 'failed'})).toMatchObject({
      notes: [],
      kind: 'error'
    })
  })
})
