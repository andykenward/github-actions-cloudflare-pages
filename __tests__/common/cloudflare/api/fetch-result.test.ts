import {error} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {CloudflareApi} from '@/common/cloudflare/api/client.js'
import {unwrap, unwrapSuccess} from '@/common/cloudflare/api/fetch-result.js'
import {CommonInputs} from '@/common/inputs.js'
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

const TestLayer = CloudflareApi.layer.pipe(Layer.provide(CommonInputs.layer))

/** `CloudflareApi.result`, which unwraps with `unwrap`. */
const getProject = Effect.gen(function* () {
  const cloudflare = yield* CloudflareApi
  return yield* cloudflare.result(client =>
    client.GET('/accounts/{account_id}/pages/projects/{project_name}', {
      params: {
        path: {account_id: MOCK_ACCOUNT_ID, project_name: MOCK_PROJECT_NAME}
      }
    })
  )
})

/** `CloudflareApi.success`, which unwraps with `unwrapSuccess`. */
const deleteDeployment = Effect.gen(function* () {
  const cloudflare = yield* CloudflareApi
  return yield* cloudflare.success(client =>
    client.DELETE(
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
  )
})

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
    it.effect('handles 200 response OK', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi.interceptCloudflare<{id: string}>(
          MOCK_API_PATH_PROJECT,
          RESPONSE_OK,
          200
        )

        expect(yield* getProject).toMatchSnapshot()
        expect(error).not.toHaveBeenCalled()
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect('handles not found 404 response', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi.interceptCloudflare<null>(
          MOCK_API_PATH_PROJECT,
          RESPONSE_NOT_FOUND,
          404
        )

        const failure = yield* Effect.flip(getProject)

        expect(failure.cause).toMatchInlineSnapshot(
          `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name) failed.]`
        )
        expect(error).toHaveBeenCalledWith(
          `Cloudflare API: Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`
        )
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect('handles unauthorized 401 response', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_PROJECT,
          RESPONSE_UNAUTHORIZED,
          401
        )

        const failure = yield* Effect.flip(getProject)

        expect(failure.cause).toMatchInlineSnapshot(
          `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name) failed.]`
        )
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect.each([{result: null}, {result: undefined}])(
      `handles response result of $result with a failure`,
      ({result}) =>
        Effect.gen(function* () {
          expect.assertions(1)

          mockApi.interceptCloudflare<null>(
            MOCK_API_PATH_PROJECT,
            {errors: [], success: true, result},
            200
          )

          const failure = yield* Effect.flip(getProject)

          expect(failure.message).toBe(
            `Cloudflare API: response missing 'result'`
          )
        }).pipe(Effect.provide(TestLayer))
    )
  })

  describe(unwrapSuccess, () => {
    it.effect('returns true when the API reports success', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi.interceptCloudflare<null>(
          MOCK_API_PATH_DEPLOYMENTS_DELETE,
          {errors: [], success: true, result: null},
          200,
          'DELETE'
        )

        expect(yield* deleteDeployment).toBe(true)
        expect(error).not.toHaveBeenCalled()
      }).pipe(Effect.provide(TestLayer))
    )

    it.effect('fails when the API returns errors', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptCloudflare<null>(
          MOCK_API_PATH_DEPLOYMENTS_DELETE,
          RESPONSE_NOT_FOUND,
          404,
          'DELETE'
        )

        const failure = yield* Effect.flip(deleteDeployment)

        expect(failure.message).toContain(`A request to the Cloudflare API`)
      }).pipe(Effect.provide(TestLayer))
    )
  })
})
