import * as core from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {FetchResult} from '@/src/cloudflare/types.js'
import RESPONSE_NOT_FOUND from '@/responses/api.cloudflare.com/pages/projects/project-not-found.response.json'
import RESPONSE_OK from '@/responses/api.cloudflare.com/pages/projects/project.response.json'
import RESPONSE_UNAUTHORIZED from '@/responses/api.cloudflare.com/unauthorized.response.json'
import {fetchResult} from '@/src/cloudflare/api/fetch-result.js'
import {ACTION_INPUT_API_TOKEN} from '@/src/constants.js'
import {getMockApi} from '@/tests/helpers/api.js'
import {setRequiredInputEnv, unsetInputEnv} from '@/tests/helpers/inputs.js'

const RESOURCE_URL_DOMAIN = `https://api.cloudflare.com`
const RESOURCE_URL_PATH = `/client/v4/accounts`
const RESOURCE_URL = `${RESOURCE_URL_DOMAIN}${RESOURCE_URL_PATH}`

vi.mock('@unlike/github-actions-core')
describe('api', () => {
  describe('fetchResult', () => {
    let mockApi: ReturnType<typeof getMockApi>

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

      mockApi.mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_PATH,
          method: `GET`
        })
        .reply<FetchResult<{id: string}>>(200, RESPONSE_OK)

      await expect(fetchResult(RESOURCE_URL)).resolves.toMatchSnapshot()
      expect(core.error).not.toHaveBeenCalled()
    })

    test('handles not found 404 response', async () => {
      const errorSpy = vi
        .spyOn(core, 'error')
        .mockImplementation((value: string | Error) => value)

      mockApi.mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_PATH,
          method: `GET`
        })
        .reply<FetchResult<null>>(404, RESPONSE_NOT_FOUND)

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
      mockApi.mockPoolCloudflare
        .intercept({
          path: RESOURCE_URL_PATH,
          method: `GET`
        })
        .reply<FetchResult>(401, RESPONSE_UNAUTHORIZED)

      await expect(
        fetchResult(RESOURCE_URL)
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        '"A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts) failed."'
      )
    })

    test.each([{result: null}, {result: undefined}])(
      `handles response result of $result with thrown error`,
      async ({result}) => {
        mockApi.mockPoolCloudflare
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
