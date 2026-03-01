import * as core from '@actions/core'
import {describe, expect, test, vi} from 'vitest'

import type {FetchResult} from '@/common/cloudflare/types.js'

import {throwFetchError} from '@/common/cloudflare/api/fetch-error.js'

const RESOURCE_URL = `https://api.cloudflare.com/path`

vi.mock(import('@actions/core'))

describe(throwFetchError, () => {
  test('throws parsed error with notes', () => {
    expect.assertions(3)

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
      `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/path) failed.]`
    )

    expect(core.error).toHaveBeenCalledTimes(1)
    expect(core.error).toHaveBeenCalledWith(
      `Cloudflare API: Authentication error [code: 10000]`
    )
  })

  test('throws parsed error with multiple notes', () => {
    expect.assertions(4)

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
      `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/path) failed.]`
    )

    expect(core.error).toHaveBeenCalledTimes(2)
    expect(core.error).toHaveBeenNthCalledWith(
      1,
      `Cloudflare API: Authentication error [code: 10000]`
    )
    expect(core.error).toHaveBeenNthCalledWith(
      2,
      `Cloudflare API: Another error [code: 20000]`
    )
  })
})
