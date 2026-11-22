import {warning} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {RecentDeployment} from '@/common/github/deployment/recent.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {setGitHubDeploymentStatus} from '@/common/github/deployment/create.js'
import {CommonLayer} from '@/common/layer.js'
import {sweepStaleDeployments} from '@/deploy/sweep.js'
import {DeploymentStatusState} from '@/gql/graphql.js'
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
vi.mock(import('@/common/github/deployment/create.js'))

const TARGET = {
  environment: 'preview',
  cloudflare: {accountId: MOCK_ACCOUNT_ID, projectName: MOCK_PROJECT_NAME}
}

const CLOUDFLARE_FIELDS = {
  environmentUrl: 'https://206e215c.cloudflare-pages-action-a5z.pages.dev',
  logUrl: `https://dash.cloudflare.com/${MOCK_ACCOUNT_ID}/pages/view/${MOCK_PROJECT_NAME}/${MOCK_DEPLOYMENT_ID}`,
  description: `Cloudflare Pages Deployment: ${MOCK_DEPLOYMENT_ID}`
}

/** Older than any live run. */
const STALE = '2020-01-01T00:00:00Z'

const deployment = (
  overrides: Partial<RecentDeployment> = {}
): RecentDeployment => ({
  id: 'DE_stale',
  createdAt: STALE,
  payload: null,
  ref: {id: 'REF_1', name: 'mock-github-head-ref'},
  commit: null,
  latestStatus: {
    id: 'DS_1',
    state: DeploymentStatusState.InProgress,
    description: CLOUDFLARE_FIELDS.description,
    logUrl: null
  },
  ...overrides
})

const deploymentResponse = (name: string, status: string) => ({
  ...RESPONSE_DEPLOYMENTS,
  result: {
    ...RESPONSE_DEPLOYMENTS.result[0],
    latest_stage: {name, status, started_on: null, ended_on: null}
  }
})

/** `it.live`: staleness is measured on the real clock. */
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('sweepStaleDeployments', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.live.each([
    {stage: 'deploy', status: 'success', state: DeploymentStatusState.Success},
    {stage: 'build', status: 'failure', state: DeploymentStatusState.Failure}
  ])(
    'settles a stale deployment as Cloudflare says ($status)',
    ({stage, status, state}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          deploymentResponse(stage, status)
        )

        yield* sweepStaleDeployments([deployment()], TARGET)

        expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
          deploymentId: 'DE_stale',
          environment: 'preview',
          state,
          ...CLOUDFLARE_FIELDS
        })
      }).pipe(Effect.provide(CommonLayer))
  )

  it.live(
    'finds the Cloudflare deployment by commit when no id was recorded',
    () =>
      Effect.gen(function* () {
        expect.assertions(1)

        // The listed deployment's commit is the fixture sha.
        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_DEPLOYMENTS
        )

        yield* sweepStaleDeployments(
          [
            deployment({
              commit: {
                id: 'C_1',
                oid: 'ffac537e6cbbf934b08745a378932722df287a53'
              },
              latestStatus: {
                id: 'DS_1',
                state: DeploymentStatusState.InProgress,
                description: null,
                logUrl: null
              }
            })
          ],
          TARGET
        )

        expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
          deploymentId: 'DE_stale',
          environment: 'preview',
          state: DeploymentStatusState.Success,
          ...CLOUDFLARE_FIELDS
        })
      }).pipe(Effect.provide(CommonLayer))
  )

  it.live('marks an error when no Cloudflare deployment can be found', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      yield* sweepStaleDeployments(
        [
          deployment({
            latestStatus: {
              id: 'DS_1',
              state: DeploymentStatusState.InProgress,
              description: null,
              logUrl: null
            }
          })
        ],
        TARGET
      )

      expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
        deploymentId: 'DE_stale',
        environment: 'preview',
        state: DeploymentStatusState.Error
      })
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live('leaves alone what is not stale, or still building', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENT,
        deploymentResponse('build', 'active')
      )

      yield* sweepStaleDeployments(
        [
          // A concurrent run, still live.
          deployment({id: 'DE_live', createdAt: new Date().toISOString()}),
          deployment({
            id: 'DE_done',
            latestStatus: {
              id: 'DS_2',
              state: DeploymentStatusState.Success,
              description: null,
              logUrl: null
            }
          }),
          deployment({id: 'DE_building'})
        ],
        TARGET
      )

      expect(setGitHubDeploymentStatus).not.toHaveBeenCalled()
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live('only warns when a deployment cannot be settled', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENT,
        {success: false, errors: [{code: 10000, message: 'Auth'}]},
        403
      )

      yield* sweepStaleDeployments([deployment()], TARGET)

      expect(warning).toHaveBeenCalledWith(
        expect.stringMatching(/^deploy sweep - Settling DE_stale failed: /)
      )
    }).pipe(Effect.provide(CommonLayer))
  )
})
