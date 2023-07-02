import {error} from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'
import RESPONSE_NOT_FOUND from '@/responses/api.cloudflare.com/pages/projects/project-not-found.response.json'
import RESPONSE_OK from '@/responses/api.cloudflare.com/pages/projects/project.response.json'
import RESPONSE_UNAUTHORIZED from '@/responses/api.cloudflare.com/unauthorized.response.json'
import {fetchResult} from '@/src/cloudflare/api/fetch-result.js'
import {ACTION_INPUT_API_TOKEN} from '@/src/constants.js'
import {
  getMockApi,
  setRequiredInputEnv,
  unsetInputEnv
} from '@/tests/helpers/index.js'

const RESOURCE_URL_DOMAIN = `https://api.cloudflare.com`
const RESOURCE_URL_PATH = `/client/v4/accounts`
const RESOURCE_URL = `${RESOURCE_URL_DOMAIN}${RESOURCE_URL_PATH}`

vi.mock('@unlike/github-actions-core')
describe('api', () => {
  describe('fetchResult', () => {
    let mockApi: MockApi

    beforeEach(() => {
      setRequiredInputEnv()
      mockApi = getMockApi()
    })

    afterEach(async () => {
      await mockApi.mockAgent.close()
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

      mockApi.interceptCloudflare<{id: string}>(
        RESOURCE_URL_PATH,
        RESPONSE_OK,
        200
      )

      await expect(fetchResult(RESOURCE_URL)).resolves.toMatchSnapshot()
      expect(error).not.toHaveBeenCalled()
    })

    test('handles not found 404 response', async () => {
      mockApi.interceptCloudflare<null>(
        RESOURCE_URL_PATH,
        RESPONSE_NOT_FOUND,
        404
      )

      await expect(
        fetchResult(RESOURCE_URL)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts) failed."'
      )
      expect(error).toHaveBeenCalledWith(
        `Cloudflare API: Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`
      )
    })

    test('handles unauthorized 401 response', async () => {
      mockApi.interceptCloudflare(RESOURCE_URL_PATH, RESPONSE_UNAUTHORIZED, 401)

      await expect(
        fetchResult(RESOURCE_URL)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts) failed."'
      )
    })

    test.each([{result: null}, {result: undefined}])(
      `handles response result of $result with thrown error`,
      async ({result}) => {
        mockApi.interceptCloudflare<null>(
          RESOURCE_URL_PATH,
          {
            errors: [],
            success: true,
            result
          },
          200
        )

        await expect(fetchResult(RESOURCE_URL)).rejects.toThrow(
          `Cloudflare API: response missing 'result'`
        )
      }
    )
  })
})
