import Cloudflare from 'cloudflare'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {statusCloudflareDeployment} from '@/common/cloudflare/deployment/status.js'
import {sleep} from '@/common/utils.js'
import RESPONSE_DEPLOYMENTS_IDLE from '@/responses/api.cloudflare.com/pages/deployments/deployments.idle.response.json' with {type: 'json'}
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {
  MOCK_ACCOUNT_ID,
  MOCK_API_PATH_DEPLOYMENTS,
  MOCK_PROJECT_NAME,
  setMockApi
} from '@/tests/helpers/api.js'

vi.mock(import('@/common/utils.js'))
vi.mock(import('@actions/core'))

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

describe(statusCloudflareDeployment, () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  test('returns success when deploy stage succeeds', async () => {
    expect.assertions(3)

    mockApi.interceptCloudflare(MOCK_API_PATH_DEPLOYMENTS, RESPONSE_DEPLOYMENTS)

    const {deployment, status} = await statusCloudflareDeployment(API_ENDPOINT)

    expect(status).toBe('success')
    expect(deployment.id).toMatchInlineSnapshot(
      `"206e215c-33b3-4ce4-adf4-7fc6c9b65483"`
    )
    expect(vi.mocked(sleep)).not.toHaveBeenCalled()
  })

  test('polls until deploy stage succeeds', async () => {
    expect.assertions(2)

    mockApi
      .interceptCloudflare(MOCK_API_PATH_DEPLOYMENTS, RESPONSE_DEPLOYMENTS_IDLE)
      .times(2)
    mockApi.interceptCloudflare(MOCK_API_PATH_DEPLOYMENTS, RESPONSE_DEPLOYMENTS)

    const {status} = await statusCloudflareDeployment(API_ENDPOINT)

    expect(status).toBe('success')
    expect(vi.mocked(sleep)).toHaveBeenCalledTimes(2)
  })

  test.for([
    {stage: 'build', status: 'failure'},
    {stage: 'build', status: 'canceled'},
    {stage: 'deploy', status: 'active'}
  ] satisfies {stage: LatestStage['name']; status: LatestStage['status']}[])(
    'returns $status immediately without polling ($stage stage)',
    async ({stage, status}) => {
      expect.assertions(2)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        withLatestStage(stage, status)
      )

      const result = await statusCloudflareDeployment(API_ENDPOINT)

      expect(result.status).toBe(status)
      expect(vi.mocked(sleep)).not.toHaveBeenCalled()
    }
  )

  test('polls while a non-deploy stage is active', async () => {
    expect.assertions(2)

    mockApi.interceptCloudflare(
      MOCK_API_PATH_DEPLOYMENTS,
      withLatestStage('build', 'active')
    )
    mockApi.interceptCloudflare(MOCK_API_PATH_DEPLOYMENTS, RESPONSE_DEPLOYMENTS)

    const {status} = await statusCloudflareDeployment(API_ENDPOINT)

    expect(status).toBe('success')
    expect(vi.mocked(sleep)).toHaveBeenCalledTimes(1)
  })

  test('throws when the api returns an error', async () => {
    expect.assertions(1)

    mockApi.interceptCloudflare(
      MOCK_API_PATH_DEPLOYMENTS,
      {result: null, success: false, errors: [], messages: []},
      404
    )

    await expect(statusCloudflareDeployment(API_ENDPOINT)).rejects.toBeInstanceOf(
      Cloudflare.APIError
    )
  })
})
