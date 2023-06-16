import type {Interceptable} from 'undici'

import * as core from '@unlike/github-actions-core'
import {MockAgent, setGlobalDispatcher} from 'undici'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {FetchResult} from '@/src/cloudflare/types.js'
import {API_RESPONSE_OK} from '@/src/cloudflare/api/__mocks__/responses/200.js'
import {API_RESPONSE_UNAUTHORIZED} from '@/src/cloudflare/api/__mocks__/responses/401.js'
import {API_RESPONSE_NOT_FOUND} from '@/src/cloudflare/api/__mocks__/responses/404.js'
import {fetchResult} from '@/src/cloudflare/api/fetch-result.js'
import {ACTION_INPUT_API_TOKEN} from '@/src/constants.js'
import {setInputEnv, unsetInputEnv} from '@/tests/helpers/inputs.js'

const RESOURCE_URL_DOMAIN = `https://api.cloudflare.com`
const RESOURCE_URL_PATH = `/client/v4/accounts`
const RESOURCE_URL = `${RESOURCE_URL_DOMAIN}${RESOURCE_URL_PATH}`

vi.mock('@unlike/github-actions-core')
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

    test('handles 200 response OK', async () => {
      expect.assertions(2)

      mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_PATH,
          method: `GET`
        })
        .reply<FetchResult<{id: string}>>(200, API_RESPONSE_OK)

      await expect(fetchResult(RESOURCE_URL)).resolves.toMatchInlineSnapshot(`
        {
          "id": "mock-id",
        }
      `)
      expect(core.error).not.toHaveBeenCalled()
    })

    test('handles not found 404 response', async () => {
      const errorSpy = vi
        .spyOn(core, 'error')
        .mockImplementation((value: string | Error) => value)

      mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_PATH,
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
      mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_PATH,
          method: `GET`
        })
        .reply<FetchResult>(401, API_RESPONSE_UNAUTHORIZED)

      await expect(
        fetchResult(RESOURCE_URL)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts) failed."'
      )
    })

    test.each([{result: null}, {result: undefined}])(
      `handles response result of $result with thrown error`,
      async ({result}) => {
        mockPoolCloudflare
          .intercept({
            path: RESOURCE_URL_PATH,
            method: `GET`
          })
          .reply<FetchResult<null>>(200, {
            errors: [],
            success: true,
            result
          })

        await expect(fetchResult(RESOURCE_URL)).rejects.toThrow(
          `Cloudflare API: response missing 'result'`
        )
      }
    )
  })
})
