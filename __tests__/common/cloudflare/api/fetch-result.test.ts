import {error} from '@actions/core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {cloudflareClient} from '@/common/cloudflare/api/client.js'
import {unwrap, unwrapSuccess} from '@/common/cloudflare/api/fetch-result.js'
import RESPONSE_NOT_FOUND from '@/responses/api.cloudflare.com/pages/projects/project-not-found.response.json' with {type: 'json'}
import RESPONSE_OK from '@/responses/api.cloudflare.com/pages/projects/project.response.json' with {type: 'json'}
import RESPONSE_UNAUTHORIZED from '@/responses/api.cloudflare.com/unauthorized.response.json' with {type: 'json'}
import {
  getMockApi,
  MOCK_ACCOUNT_ID,
  MOCK_API_PATH_DEPLOYMENTS_DELETE,
  MOCK_API_PATH_PROJECT,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME
} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

const getProject = () =>
  cloudflareClient.GET('/accounts/{account_id}/pages/projects/{project_name}', {
    params: {
      path: {account_id: MOCK_ACCOUNT_ID, project_name: MOCK_PROJECT_NAME}
    }
  })

const deleteDeployment = () =>
  cloudflareClient.DELETE(
    '/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}',
    {
      params: {
        path: {
          account_id: MOCK_ACCOUNT_ID,
          project_name: MOCK_PROJECT_NAME,
          deployment_id: MOCK_DEPLOYMENT_ID
        },
        query: {force: true}
      }
    }
  )

describe('api', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  describe(unwrap, () => {
    test('handles 200 response OK', async () => {
      expect.assertions(2)

      mockApi.interceptCloudflare<{id: string}>(
        MOCK_API_PATH_PROJECT,
        RESPONSE_OK,
        200
      )

      expect(unwrap(await getProject())).toMatchSnapshot()
      expect(error).not.toHaveBeenCalled()
    })

    test('handles not found 404 response', async () => {
      expect.assertions(2)

      mockApi.interceptCloudflare<null>(
        MOCK_API_PATH_PROJECT,
        RESPONSE_NOT_FOUND,
        404
      )

      const response = await getProject()

      expect(() => unwrap(response)).toThrowErrorMatchingInlineSnapshot(
        `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name) failed.]`
      )
      expect(error).toHaveBeenCalledWith(
        `Cloudflare API: Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`
      )
    })

    test('handles unauthorized 401 response', async () => {
      expect.assertions(1)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_PROJECT,
        RESPONSE_UNAUTHORIZED,
        401
      )

      const response = await getProject()

      expect(() => unwrap(response)).toThrowErrorMatchingInlineSnapshot(
        `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name) failed.]`
      )
    })

    test.each([{result: null}, {result: undefined}])(
      `handles response result of $result with thrown error`,
      async ({result}) => {
        expect.assertions(1)

        mockApi.interceptCloudflare<null>(
          MOCK_API_PATH_PROJECT,
          {errors: [], success: true, result},
          200
        )

        const response = await getProject()

        expect(() => unwrap(response)).toThrow(
          `Cloudflare API: response missing 'result'`
        )
      }
    )
  })

  describe(unwrapSuccess, () => {
    test('returns true when the API reports success', async () => {
      expect.assertions(2)

      mockApi.interceptCloudflare<null>(
        MOCK_API_PATH_DEPLOYMENTS_DELETE,
        {errors: [], success: true, result: null},
        200,
        'DELETE'
      )

      expect(unwrapSuccess(await deleteDeployment())).toBe(true)
      expect(error).not.toHaveBeenCalled()
    })

    test('throws when the API returns errors', async () => {
      expect.assertions(1)

      mockApi.interceptCloudflare<null>(
        MOCK_API_PATH_DEPLOYMENTS_DELETE,
        RESPONSE_NOT_FOUND,
        404,
        'DELETE'
      )

      const response = await deleteDeployment()

      expect(() => unwrapSuccess(response)).toThrow(
        `A request to the Cloudflare API`
      )
    })
  })
})
