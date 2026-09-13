import {it} from '@effect/vitest'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Fiber from 'effect/Fiber'
import * as Layer from 'effect/Layer'
import {TestClock} from 'effect/testing'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {CloudflareApi} from '@/common/cloudflare/api/client.js'
import {
  PollCountMax,
  PollTimeout,
  statusCloudflareDeployment
} from '@/common/cloudflare/deployment/status.js'
import {GitHubContext} from '@/common/github/context.js'
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
import {NoPollDelay} from '@/tests/helpers/layers.js'

vi.mock(import('@actions/core'))

/** The real services, polling without delay. */
const TestLayer = Layer.mergeAll(CommonLayer, NoPollDelay)

/**
 * A `CloudflareApi` that always lists the deployment as idle, so every poll
 * is pending and only the ceiling ends it. With no HTTP involved the polls
 * sleep on the `TestClock`, which can run the real 10 minutes.
 */
const IdleCloudflare = Layer.succeed(
  CloudflareApi,
  CloudflareApi.of({
    result: () => Effect.succeed(RESPONSE_DEPLOYMENTS_IDLE.result as never),
    success: () => Effect.void
  })
)

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
 * `it.live`: the HTTP mocks reply on the real clock, so the polls do too.
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

      const {deployment, status} =
        yield* statusCloudflareDeployment(API_ENDPOINT)

      expect(status).toBe('success')
      expect(deployment.id).toMatchInlineSnapshot(
        `"206e215c-33b3-4ce4-adf4-7fc6c9b65483"`
      )
    }).pipe(Effect.provide(TestLayer))
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

      const {status} = yield* statusCloudflareDeployment(API_ENDPOINT)

      expect(status).toBe('success')
    }).pipe(Effect.provide(TestLayer))
  )

  it.live('keeps polling while the deploy stage is still active', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // `active` means the stage is running, not that the deploy is live.
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        withLatestStage('deploy', 'active')
      )
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )

      const {status} = yield* statusCloudflareDeployment(API_ENDPOINT)

      expect(status).toBe('success')
    }).pipe(Effect.provide(TestLayer))
  )

  it.live('keeps polling after an earlier stage succeeds', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // e.g. `build` done, `deploy` not started: only `deploy` success is live.
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        withLatestStage('build', 'success')
      )
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )

      const {status} = yield* statusCloudflareDeployment(API_ENDPOINT)

      expect(status).toBe('success')
    }).pipe(Effect.provide(TestLayer))
  )

  it.live('polls when the deployment is not registered yet', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      // Immediately after wrangler returns, Cloudflare has usually not yet
      // registered the deployment. This previously threw on the first poll and
      // failed the whole action. The list already holds other commits'
      // deployments, so only the commit hash tells them apart.
      const [registered, ...others] = RESPONSE_DEPLOYMENTS.result
      mockApi.interceptCloudflare(MOCK_API_PATH_DEPLOYMENTS, {
        ...RESPONSE_DEPLOYMENTS,
        result: others
      })
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )

      const {deployment, status} =
        yield* statusCloudflareDeployment(API_ENDPOINT)

      expect(status).toBe('success')
      expect(deployment.id).toBe(registered?.id)
    }).pipe(Effect.provide(TestLayer))
  )

  it.live('times out when a poll is still waiting for its reply', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // The reply would succeed, but only after the timeout: the retry
      // schedule never gets another step, so only the overall timeout ends it.
      mockApi
        .interceptCloudflare(MOCK_API_PATH_DEPLOYMENTS, RESPONSE_DEPLOYMENTS)
        .delay(200)

      const error = yield* Effect.flip(statusCloudflareDeployment(API_ENDPOINT))

      expect(error).toMatchObject({
        _tag: 'DeploymentPollTimeoutError',
        message:
          'Status Of Deployment: timed out after 50ms waiting for the deploy stage to complete.'
      })
    }).pipe(
      Effect.provide(Layer.succeed(PollTimeout, Duration.millis(50))),
      Effect.provide(TestLayer)
    )
  )

  it.live('gives up after PollCountMax polls, whatever the clock says', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // `times: 2` steps the schedule twice after the first poll: three polls.
      mockApi
        .interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_DEPLOYMENTS_IDLE
        )
        .times(3)

      const error = yield* Effect.flip(statusCloudflareDeployment(API_ENDPOINT))

      expect(error).toMatchObject({_tag: 'DeploymentPollTimeoutError'})
    }).pipe(
      Effect.provide(Layer.succeed(PollCountMax, 2)),
      Effect.provide(TestLayer)
    )
  )

  it.effect('times out after the default 10 minutes of pending polls', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      const fiber = yield* Effect.forkChild(
        Effect.flip(statusCloudflareDeployment(API_ENDPOINT))
      )
      yield* TestClock.adjust(Duration.minutes(10))

      expect(yield* Fiber.join(fiber)).toMatchObject({
        _tag: 'DeploymentPollTimeoutError',
        message:
          'Status Of Deployment: timed out after 10m waiting for the deploy stage to complete.'
      })
    }).pipe(Effect.provide(Layer.mergeAll(IdleCloudflare, GitHubContext.layer)))
  )

  it.live.each([
    {stage: 'build', status: 'failure'},
    {stage: 'build', status: 'canceled'}
  ] satisfies {stage: LatestStage['name']; status: LatestStage['status']}[])(
    'returns $status immediately without polling ($stage stage)',
    ({stage, status}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          withLatestStage(stage, status)
        )

        const result = yield* statusCloudflareDeployment(API_ENDPOINT)

        expect(result.status).toBe(status)
      }).pipe(Effect.provide(TestLayer))
  )

  it.live('fails without retrying when the api returns an error', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        {result: null, success: false, errors: [], messages: []},
        404
      )

      const error = yield* Effect.flip(statusCloudflareDeployment(API_ENDPOINT))

      expect(error).toMatchObject({
        _tag: 'CloudflareApiError',
        message: `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/deployments) failed.`
      })
    }).pipe(Effect.provide(TestLayer))
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

      const {deployment, status} = yield* statusCloudflareDeployment({
        ...API_ENDPOINT,
        deploymentId: MOCK_DEPLOYMENT_ID
      })

      expect(status).toBe('success')
      expect(deployment.id).toBe(RESPONSE_DEPLOYMENTS.result[0]?.id)
    }).pipe(Effect.provide(TestLayer))
  )
})
