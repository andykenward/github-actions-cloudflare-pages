import {error, info, warning} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {FetchResult} from '@/common/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {deleteCloudflareDeployment} from '@/common/cloudflare/deployment/delete.js'
import RESPONSE_DELETE_NOT_FOUND from '@/responses/api.cloudflare.com/pages/deployments/deployments-delete-not-found.response.json' with {type: 'json'}
import RESPONSE_DELETE from '@/responses/api.cloudflare.com/pages/deployments/deployments-delete.response.json' with {type: 'json'}
import RESPONSE_PROJECT_NOT_FOUND from '@/responses/api.cloudflare.com/pages/projects/project-not-found.response.json' with {type: 'json'}
import RESPONSE_UNAUTHORIZED from '@/responses/api.cloudflare.com/unauthorized.response.json' with {type: 'json'}
import {
  getMockApi,
  MOCK_ACCOUNT_ID,
  MOCK_API_PATH_DEPLOYMENTS_DELETE,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME
} from '@/tests/helpers/api.js'
import {CloudflareApiTestLayer} from '@/tests/helpers/layers.js'

vi.mock(import('@actions/core'))

const DEPLOYMENT = {
  id: MOCK_DEPLOYMENT_ID,
  accountId: MOCK_ACCOUNT_ID,
  projectName: MOCK_PROJECT_NAME
}

const REQUEST_FAILED = `A request to the Cloudflare API (https://api.cloudflare.com${MOCK_API_PATH_DEPLOYMENTS_DELETE}) failed.`

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('deleteCloudflareDeployment', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect('force-deletes the deployment and logs its id', () =>
    Effect.gen(function* () {
      expect.assertions(4)

      // The path carries `?force=true`, so an unforced delete would not match.
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS_DELETE,
        RESPONSE_DELETE,
        200,
        'DELETE'
      )

      expect(yield* deleteCloudflareDeployment(DEPLOYMENT)).toBe(true)
      expect(info).toHaveBeenCalledWith(
        `Cloudflare Deployment Deleted: ${MOCK_DEPLOYMENT_ID}`
      )
      expect(warning).not.toHaveBeenCalled()
      expect(error).not.toHaveBeenCalled()
    }).pipe(Effect.provide(CloudflareApiTestLayer))
  )

  it.effect('counts a deployment that no longer exists as deleted', () =>
    Effect.gen(function* () {
      expect.assertions(4)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS_DELETE,
        RESPONSE_DELETE_NOT_FOUND,
        404,
        'DELETE'
      )

      expect(yield* deleteCloudflareDeployment(DEPLOYMENT)).toBe(true)
      expect(warning).toHaveBeenCalledWith(
        `Cloudflare Deployment might have been deleted already: ${MOCK_DEPLOYMENT_ID}`
      )
      expect(info).not.toHaveBeenCalled()
      // A tolerated error leaves no error annotation on the run.
      expect(error).not.toHaveBeenCalled()
    }).pipe(Effect.provide(CloudflareApiTestLayer))
  )

  it.effect.each<{
    title: string
    response: FetchResult
    status: number
    reason: string
  }>([
    {
      title: 'the project does not exist',
      response: RESPONSE_PROJECT_NOT_FOUND,
      status: 404,
      reason: `${REQUEST_FAILED} Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`
    },
    {
      title: 'the API token is rejected',
      response: RESPONSE_UNAUTHORIZED,
      status: 401,
      reason: `${REQUEST_FAILED} Authentication error [code: 10000]`
    },
    {
      title: 'the API reports failure without errors',
      response: {success: false, errors: [], result: null},
      status: 200,
      reason: 'Cloudflare Delete Deployment: fail'
    }
  ])(
    'returns false and logs the reason when $title',
    ({response, status, reason}) =>
      Effect.gen(function* () {
        expect.assertions(3)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS_DELETE,
          response,
          status,
          'DELETE'
        )

        expect(yield* deleteCloudflareDeployment(DEPLOYMENT)).toBe(false)
        expect(error).toHaveBeenLastCalledWith(
          `Cloudflare Error deleting deployment: ${MOCK_DEPLOYMENT_ID} - ${reason}`
        )
        expect(warning).not.toHaveBeenCalled()
      }).pipe(Effect.provide(CloudflareApiTestLayer))
  )

  it.effect('returns false when Cloudflare replies with no content', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      mockApi
        .interceptCloudflareRaw(MOCK_API_PATH_DEPLOYMENTS_DELETE, 'DELETE')
        .reply(204, '')

      expect(yield* deleteCloudflareDeployment(DEPLOYMENT)).toBe(false)
      expect(error).toHaveBeenCalledWith(
        `Cloudflare Error deleting deployment: ${MOCK_DEPLOYMENT_ID} - Cloudflare Delete Deployment: fail`
      )
    }).pipe(Effect.provide(CloudflareApiTestLayer))
  )

  it.effect('returns false rather than failing when the request errors', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      mockApi
        .interceptCloudflareRaw(MOCK_API_PATH_DEPLOYMENTS_DELETE, 'DELETE')
        .replyWithError(new Error('socket hang up'))

      expect(yield* deleteCloudflareDeployment(DEPLOYMENT)).toBe(false)
      expect(error).toHaveBeenCalledWith(
        `Cloudflare Error deleting deployment: ${MOCK_DEPLOYMENT_ID} - fetch failed`
      )
    }).pipe(Effect.provide(CloudflareApiTestLayer))
  )
})
