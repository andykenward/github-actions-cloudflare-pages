import core from '@actions/core'
import {beforeEach, describe, expect, test, vi, type SpyInstance} from 'vitest'

import {throwFetchError} from '../../../cloudflare/api/fetch-error.js'
import type {FetchResult} from '../../../cloudflare/types.js'

const RESOURCE_URL = `https://api.cloudflare.com/path`

describe('throwFetchError', () => {
  let errorSpy: SpyInstance<
    Parameters<typeof core.error>,
    ReturnType<typeof core.error>
  >

  beforeEach(() => {
    errorSpy = vi
      .spyOn(core, 'error')
      .mockImplementation((value: string | Error) => value)
  })

  test('throws parsed error with notes', () => {
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
      '"A request to the Cloudflare API (https://api.cloudflare.com/path) failed."'
    )

    expect(errorSpy).toHaveBeenCalledTimes(1)
    expect(errorSpy).toHaveBeenCalledWith(
      `Cloudflare API: Authentication error [code: 10000]`
    )
  })

  test('throws parsed error with multiple notes', () => {
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
    9
    expect(() =>
      throwFetchError(RESOURCE_URL, ERRORS)
    ).toThrowErrorMatchingInlineSnapshot(
      '"A request to the Cloudflare API (https://api.cloudflare.com/path) failed."'
    )

    expect(errorSpy).toHaveBeenCalledTimes(2)
    expect(errorSpy).toHaveBeenNthCalledWith(
      1,
      `Cloudflare API: Authentication error [code: 10000]`
    )
    expect(errorSpy).toHaveBeenNthCalledWith(
      2,
      `Cloudflare API: Another error [code: 20000]`
    )
  })
})
