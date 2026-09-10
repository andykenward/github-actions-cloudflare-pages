import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {statusCloudflareDeployment} from '@/common/cloudflare/deployment/status.js'
import {CommonLayer} from '@/common/layer.js'
import RESPONSE_DEPLOYMENTS_IDLE from '@/responses/api.cloudflare.com/pages/deployments/deployments.idle.response.json' with {type: 'json'}
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {
  MOCK_ACCOUNT_ID,
  MOCK_API_PATH_DEPLOYMENT,
  MOCK_API_PATH_DEPLOYMENTS,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME,
  setMockApi
} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

/** Poll with no delay; the interceptors assert the call count instead. */
const POLL_OPTIONS = {pollInterval: 0} as const

const API_ENDPOINT = {
  accountId: MOCK_ACCOUNT_ID,
  projectName: MOCK_PROJECT_NAME
}

type LatestStage = PagesDeployment['latest_stage']

const withLatestStage = (
  name: LatestStage['name'],
  status: LatestStage['status']
): typeof RESPONSE_DEPLOYMENTS => ({
  ...RESPONSE_DEPLOYMENTS,
  result: RESPONSE_DEPLOYMENTS.result.map((deployment, index) =>
    index === 0
      ? {
          ...deployment,
          latest_stage: {
            name,
            status,
            started_on: null,
            ended_on: null
          } as LatestStage
        }
      : deployment
  ) as (typeof RESPONSE_DEPLOYMENTS)['result']
})

/**
 * `it.live`: polling sleeps on the real clock between polls.
 * `Effect.fn` returns an anonymous function, so the title is a string.
 */
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('statusCloudflareDeployment', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.live('returns success when deploy stage succeeds', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )

      const {deployment, status} = yield* statusCloudflareDeployment(
        API_ENDPOINT,
        POLL_OPTIONS
      )

      expect(status).toBe('success')
      expect(deployment.id).toMatchInlineSnapshot(
        `"206e215c-33b3-4ce4-adf4-7fc6c9b65483"`
      )
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live('polls until deploy stage succeeds', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi
        .interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_DEPLOYMENTS_IDLE
        )
        .times(2)
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )

      const {status} = yield* statusCloudflareDeployment(
        API_ENDPOINT,
        POLL_OPTIONS
      )

      expect(status).toBe('success')
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live('polls when the deployment is not registered yet', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // Immediately after wrangler returns, Cloudflare has usually not yet
      // registered the deployment. This previously threw on the first poll and
      // failed the whole action.
      mockApi.interceptCloudflare(MOCK_API_PATH_DEPLOYMENTS, {
        ...RESPONSE_DEPLOYMENTS,
        result: []
      })
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )

      const {status} = yield* statusCloudflareDeployment(
        API_ENDPOINT,
        POLL_OPTIONS
      )

      expect(status).toBe('success')
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live('times out instead of polling forever', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi
        .interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_DEPLOYMENTS_IDLE
        )
        .persist()

      const error = yield* Effect.flip(
        statusCloudflareDeployment(API_ENDPOINT, {
          pollInterval: 5,
          pollTimeout: 50
        })
      )

      expect(error).toMatchObject({
        _tag: 'DeploymentPollTimeoutError',
        // oxlint-disable-next-line typescript/no-unsafe-assignment
        message: expect.stringMatching(/timed out/)
      })
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live.each([
    {stage: 'build', status: 'failure'},
    {stage: 'build', status: 'canceled'},
    {stage: 'deploy', status: 'active'}
  ] satisfies {stage: LatestStage['name']; status: LatestStage['status']}[])(
    'returns $status immediately without polling ($stage stage)',
    ({stage, status}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          withLatestStage(stage, status)
        )

        const result = yield* statusCloudflareDeployment(
          API_ENDPOINT,
          POLL_OPTIONS
        )

        expect(result.status).toBe(status)
      }).pipe(Effect.provide(CommonLayer))
  )

  it.live('polls while a non-deploy stage is active', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        withLatestStage('build', 'active')
      )
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )

      const {status} = yield* statusCloudflareDeployment(
        API_ENDPOINT,
        POLL_OPTIONS
      )

      expect(status).toBe('success')
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live('fails without retrying when the api returns an error', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        {result: null, success: false, errors: [], messages: []},
        404
      )

      const error = yield* Effect.flip(
        statusCloudflareDeployment(API_ENDPOINT, POLL_OPTIONS)
      )

      expect(error).toMatchObject({
        _tag: 'CloudflareApiError',
        message: `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/deployments) failed.`
      })
    }).pipe(Effect.provide(CommonLayer))
  )
})

/** A single-deployment GET response whose `deploy` stage has `status`. */
const deploymentResponse = (status: LatestStage['status']) => ({
  ...RESPONSE_DEPLOYMENTS,
  result: {
    ...RESPONSE_DEPLOYMENTS.result[0],
    latest_stage: {name: 'deploy', status, started_on: null, ended_on: null}
  }
})

describe('statusCloudflareDeployment with a deployment id', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.live('polls that deployment until its deploy stage succeeds', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      // No list interceptor: a list request would fail, as net connect is off.
      mockApi
        .interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          deploymentResponse('idle')
        )
        .times(2)
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENT,
        deploymentResponse('success')
      )

      const {deployment, status} = yield* statusCloudflareDeployment(
        {...API_ENDPOINT, deploymentId: MOCK_DEPLOYMENT_ID},
        POLL_OPTIONS
      )

      expect(status).toBe('success')
      expect(deployment.id).toBe(RESPONSE_DEPLOYMENTS.result[0]?.id)
    }).pipe(Effect.provide(CommonLayer))
  )
})
