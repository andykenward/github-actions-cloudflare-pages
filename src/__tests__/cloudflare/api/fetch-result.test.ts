import core from '@actions/core'
import {MockAgent, setGlobalDispatcher, type Interceptable} from 'undici'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {API_RESPONSE_UNAUTHORIZED} from '@/cloudflare/api/__mocks__/responses/401'
import {API_RESPONSE_NOT_FOUND} from '@/cloudflare/api/__mocks__/responses/404'
import {
  ACTION_INPUT_API_TOKEN,
  fetchResult
} from '@/cloudflare/api/fetch-result'
import type {FetchNoResult, FetchResult} from '@/cloudflare/types'
import {setInputEnv, unsetInputEnv} from '@/helpers/inputs'

const RESOURCE_URL_DOMAIN = `https://api.cloudflare.com`
const RESOURCE_URL_SUFFIX = `/client/v4/accounts`
const RESOURCE_URL = `${RESOURCE_URL_DOMAIN}${RESOURCE_URL_SUFFIX}`

describe('api', () => {
  describe('fetchResult', () => {
    /** Mock Fetch request that use undici. */
    let mockAgent: MockAgent
    let mockPoolCloudflare: Interceptable

    beforeEach(() => {
      setInputEnv(ACTION_INPUT_API_TOKEN, 'mock-api-token')

      mockAgent = new MockAgent()
      mockAgent.disableNetConnect() // prevent actual requests
      setGlobalDispatcher(mockAgent) // enabled the mock client to intercept requests
      mockPoolCloudflare = mockAgent.get(RESOURCE_URL_DOMAIN)
    })

    afterEach(async () => {
      vi.clearAllMocks()
      await mockAgent.close()
    })

    test(`throws error if ${ACTION_INPUT_API_TOKEN} undefined`, async () => {
      unsetInputEnv(ACTION_INPUT_API_TOKEN)
      await expect(
        fetchResult(RESOURCE_URL)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"Input required and not supplied: apiToken"'
      )
    })

    test('handles not found 404 response', async () => {
      // setInputEnv(ACTION_INPUT_API_TOKEN, 'mock-api-token')

      const errorSpy = vi
        .spyOn(core, 'error')
        .mockImplementation((value: string | Error) => value)

      mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_SUFFIX,
          method: `GET`
        })
        .reply<FetchResult<null>>(404, API_RESPONSE_NOT_FOUND)

      await expect(
        fetchResult(RESOURCE_URL)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts) failed."'
      )
      expect(errorSpy).toHaveBeenCalledWith(
        `Cloudflare API: Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`
      )
    })

    test('handles unauthorized 401 response', async () => {
      // setInputEnv(ACTION_INPUT_API_TOKEN, 'mock-api-token')
      mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_SUFFIX,
          method: `GET`
        })
        .reply<FetchNoResult>(401, API_RESPONSE_UNAUTHORIZED)

      await expect(
        fetchResult(RESOURCE_URL)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts) failed."'
      )
    })
  })
})
