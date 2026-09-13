import * as core from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Fiber from 'effect/Fiber'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {FetchResult} from '@/common/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {CloudflareApi} from '@/common/cloudflare/api/client.js'
import {ApiErrors, CloudflareApiError} from '@/common/cloudflare/api/error.js'
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
import {CloudflareApiTestLayer} from '@/tests/helpers/layers.js'

vi.mock(import('@actions/core'))

const PROJECT_URL = `https://api.cloudflare.com${MOCK_API_PATH_PROJECT}`
const DELETE_URL = `https://api.cloudflare.com${MOCK_API_PATH_DEPLOYMENTS_DELETE}`

/** `CloudflareApi.result`, which unwraps with `unwrap`. */
const getProject = Effect.gen(function* () {
  const cloudflare = yield* CloudflareApi
  return yield* cloudflare.result((client, signal) =>
    client.GET('/accounts/{account_id}/pages/projects/{project_name}', {
      params: {
        path: {account_id: MOCK_ACCOUNT_ID, project_name: MOCK_PROJECT_NAME}
      },
      signal
    })
  )
})

/** `CloudflareApi.success`, which unwraps with `unwrapSuccess`. */
const deleteDeployment = Effect.gen(function* () {
  const cloudflare = yield* CloudflareApi
  return yield* cloudflare.success((client, signal) =>
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
        },
        signal
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
        expect.assertions(1)

        mockApi.interceptCloudflare<{id: string}>(
          MOCK_API_PATH_PROJECT,
          RESPONSE_OK,
          200
        )

        expect(yield* getProject).toStrictEqual(RESPONSE_OK.result)
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect('fails with the envelope errors on a 404', () =>
      Effect.gen(function* () {
        expect.assertions(3)

        mockApi.interceptCloudflare<null>(
          MOCK_API_PATH_PROJECT,
          RESPONSE_NOT_FOUND,
          404
        )

        const failure = yield* Effect.flip(getProject)

        expect(failure.message).toBe(
          `A request to the Cloudflare API (${PROJECT_URL}) failed. Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`
        )
        expect(failure.reason).toMatchObject({
          _tag: 'ApiErrors',
          url: PROJECT_URL,
          code: 8000007
        })
        // A caller may tolerate the error, so reporting it is the caller's job.
        expect(core.error).not.toHaveBeenCalled()
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect(
      'fails with the HTTP status when the error body is not JSON',
      () =>
        Effect.gen(function* () {
          expect.assertions(2)

          // e.g. an HTML error page from Cloudflare's edge.
          mockApi
            .interceptCloudflareRaw(MOCK_API_PATH_PROJECT, 'GET')
            .reply(502, '<html>Bad gateway</html>')

          const failure = yield* Effect.flip(getProject)

          expect(failure.message).toBe(
            `A request to the Cloudflare API (${PROJECT_URL}) failed: 502 Bad Gateway`
          )
          expect(failure.reason).toMatchObject({
            _tag: 'HttpError',
            status: 502,
            statusText: 'Bad Gateway'
          })
        }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect('fails with the envelope errors when a 200 reports failure', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_PROJECT,
          RESPONSE_UNAUTHORIZED,
          200
        )

        const failure = yield* Effect.flip(getProject)

        expect(failure.reason).toMatchObject({_tag: 'ApiErrors', code: 10000})
        expect(failure.message).toContain('Authentication error [code: 10000]')
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect('fails with the status when a 2xx response has no body', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        // A `204 No Content`, which openapi-fetch returns with no `data`.
        mockApi
          .interceptCloudflareRaw(MOCK_API_PATH_PROJECT, 'GET')
          .reply(204, '')

        const failure = yield* Effect.flip(getProject)

        expect(failure.message).toBe(
          `A request to the Cloudflare API (${PROJECT_URL}) failed: 204 No Content`
        )
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect.each([{result: null}, {result: undefined}])(
      `handles response result of $result with a failure`,
      ({result}) =>
        Effect.gen(function* () {
          expect.assertions(2)

          mockApi.interceptCloudflare<null>(
            MOCK_API_PATH_PROJECT,
            {errors: [], success: true, result},
            200
          )

          const failure = yield* Effect.flip(getProject)

          expect(failure.reason._tag).toBe('MissingResult')
          expect(failure.message).toBe(
            `A request to the Cloudflare API (${PROJECT_URL}) failed: response missing 'result'`
          )
        }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect('fails with the request error when the fetch rejects', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi
          .interceptCloudflareRaw(MOCK_API_PATH_PROJECT, 'GET')
          .replyWithError(new Error('socket hang up'))

        const failure = yield* Effect.flip(getProject)

        expect(failure.reason._tag).toBe('RequestError')
        expect(failure.message).toBe('fetch failed')
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect('aborts the request when the effect is interrupted', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        const cloudflare = yield* CloudflareApi
        let signal: AbortSignal | undefined

        // A request that settles only when aborted, standing in for a hung
        // fetch: openapi-fetch passes `signal` straight to `fetch`.
        const hung = cloudflare.result<unknown>((_client, requestSignal) => {
          signal = requestSignal
          return new Promise((_resolve, reject) => {
            requestSignal.addEventListener('abort', () =>
              reject(new Error('aborted'))
            )
          })
        })

        const fiber = yield* Effect.forkChild(hung)
        yield* Effect.yieldNow
        yield* Fiber.interrupt(fiber)

        expect(signal).toBeDefined()
        expect(signal?.aborted).toBe(true)
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )
  })

  describe(unwrapSuccess, () => {
    it.effect('succeeds when the envelope reports success', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS_DELETE,
          {success: true, errors: [], result: null},
          200,
          'DELETE'
        )

        expect(yield* deleteDeployment).toBeUndefined()
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect(
      'fails with the HTTP status when the error body is not JSON',
      () =>
        Effect.gen(function* () {
          expect.assertions(1)

          mockApi
            .interceptCloudflareRaw(MOCK_API_PATH_DEPLOYMENTS_DELETE, 'DELETE')
            .reply(502, '<html>Bad gateway</html>')

          const failure = yield* Effect.flip(deleteDeployment)

          expect(failure.message).toBe(
            `A request to the Cloudflare API (${DELETE_URL}) failed: 502 Bad Gateway`
          )
        }).pipe(Effect.provide(CloudflareApiTestLayer))
    )

    it.effect('fails when the envelope reports failure without errors', () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS_DELETE,
          {success: false, errors: [], result: null},
          200,
          'DELETE'
        )

        const failure = yield* Effect.flip(deleteDeployment)

        expect(failure.reason).toMatchObject({_tag: 'ApiErrors', errors: []})
        expect(failure.message).toBe(
          `A request to the Cloudflare API (${DELETE_URL}) failed.`
        )
      }).pipe(Effect.provide(CloudflareApiTestLayer))
    )
  })
})

describe(CloudflareApiError, () => {
  const RESOURCE_URL = `https://api.cloudflare.com/path`

  const apiErrors = (errors: FetchResult['errors']) =>
    CloudflareApiError.from(new ApiErrors({url: RESOURCE_URL, errors}))

  test('puts every error in the message', () => {
    expect.assertions(1)

    expect(
      apiErrors([
        {code: 10000, message: 'Authentication error'},
        {code: 20000, message: 'Another error'}
      ]).message
    ).toBe(
      `A request to the Cloudflare API (${RESOURCE_URL}) failed. Authentication error [code: 10000] Another error [code: 20000]`
    )
  })

  test('takes the code from the first error', () => {
    expect.assertions(1)

    expect(
      apiErrors([
        {code: 8000009, message: 'The deployment ID does not exist.'},
        {code: 10000, message: 'Authentication error'}
      ]).reason
    ).toMatchObject({code: 8000009})
  })

  test('renders each chained error beneath its parent, indented by depth', () => {
    expect.assertions(1)

    expect(
      apiErrors([
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
      ]).message
    ).toBe(
      `A request to the Cloudflare API (${RESOURCE_URL}) failed. Deployment failed [code: 8000000]
- Build failed [code: 8000001]
  - Out of memory [code: 8000002]

- Upload failed [code: 8000003]`
    )
  })

  test('stops rendering a chain after 64 errors', () => {
    expect.assertions(3)

    let chain: FetchResult['errors'][number] = {code: 1, message: 'leaf'}
    for (let depth = 0; depth < 100; depth++) {
      chain = {code: 1, message: `level ${depth}`, error_chain: [chain]}
    }

    const {message} = apiErrors([chain])

    expect(message).toContain('level 99 [code: 1]')
    expect(message).toMatch(/\n- … \(more errors omitted\)$/)
    expect(message).not.toContain('leaf')
  })

  test('has no code when there are no errors', () => {
    expect.assertions(1)

    expect(apiErrors([]).reason).toMatchObject({code: undefined})
  })
})
