import {warning} from '@actions/core'
import {it} from '@effect/vitest'
import * as Cause from 'effect/Cause'
import * as Effect from 'effect/Effect'
import * as Ref from 'effect/Ref'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {DeployRecord} from '@/deploy/report.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubApiError} from '@/common/github/api/client.js'
import {updateComment} from '@/common/github/comment.js'
import {setGitHubDeploymentStatus} from '@/common/github/deployment/create.js'
import {CommonLayer} from '@/common/layer.js'
import {reportDeployFailure} from '@/deploy/report.js'
import {
  DeploymentStatusState,
  GetRecentDeploymentsDocument
} from '@/gql/graphql.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {
  MOCK_ACCOUNT_ID,
  MOCK_API_PATH_DEPLOYMENT,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME,
  setMockApi
} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))
vi.mock(import('@/common/github/deployment/create.js'))
vi.mock(import('@/common/github/comment.js'))

const RECORD: DeployRecord = {
  deploymentId: 'DE_mine',
  commentId: 'IC_1',
  cloudflare: {accountId: MOCK_ACCOUNT_ID, projectName: MOCK_PROJECT_NAME},
  environment: 'preview'
}

const CLOUDFLARE_FIELDS = {
  environmentUrl: 'https://206e215c.cloudflare-pages-action-a5z.pages.dev',
  logUrl: `https://dash.cloudflare.com/${MOCK_ACCOUNT_ID}/pages/view/${MOCK_PROJECT_NAME}/${MOCK_DEPLOYMENT_ID}`,
  description: `Cloudflare Pages Deployment: ${MOCK_DEPLOYMENT_ID}`
}

const FAILURE = Cause.fail(new Error('Polling timed out'))

const deploymentResponse = (name: string, status: string) => ({
  ...RESPONSE_DEPLOYMENTS,
  result: {
    ...RESPONSE_DEPLOYMENTS.result[0],
    latest_stage: {name, status, started_on: null, ended_on: null}
  }
})

const lastCommentBody = (): string =>
  vi.mocked(updateComment).mock.lastCall?.[1] ?? ''

/** Reports `cause`, with `deploymentId` as what wrangler recorded. */
const report = (cause: Cause.Cause<unknown>, deploymentId?: string) =>
  Effect.gen(function* () {
    const deploymentIdRef = yield* Ref.make(deploymentId)
    return yield* reportDeployFailure(RECORD, cause, deploymentIdRef)
  })

// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('reportDeployFailure', () => {
  let mockApi: MockApi

  /** The branch's deployments, newest first, for the newest-run check. */
  const interceptRecent = (ids: Array<string>, statusCode?: number) =>
    mockApi.interceptGithub(
      {
        query: GetRecentDeploymentsDocument,
        variables: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          environment: 'preview'
        }
      },
      {
        data: {
          repository: {
            deployments: {
              nodes: ids.map(id => ({
                id,
                createdAt: '2026-11-22T10:00:00Z',
                payload: null,
                ref: {id: 'REF_1', name: 'mock-github-head-ref'},
                commit: null,
                latestStatus: null
              }))
            }
          }
        }
      },
      statusCode
    )

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect(
    'marks a deployment that went live successful, noting the failure',
    () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          deploymentResponse('deploy', 'success')
        )
        interceptRecent(['DE_mine'])

        yield* report(FAILURE, MOCK_DEPLOYMENT_ID)

        expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
          deploymentId: 'DE_mine',
          environment: 'preview',
          state: DeploymentStatusState.Success,
          ...CLOUDFLARE_FIELDS
        })
        expect(lastCommentBody()).toMatch(
          /✅ Ready[\s\S]*> Deployed, but the action then failed: Polling timed out/
        )
      }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('leaves a deployment still building in progress', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENT,
        deploymentResponse('build', 'active')
      )
      interceptRecent(['DE_mine'])

      yield* report(FAILURE, MOCK_DEPLOYMENT_ID)

      // Re-recorded with the id, so the sweep and delete can find it.
      expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
        deploymentId: 'DE_mine',
        environment: 'preview',
        state: DeploymentStatusState.InProgress,
        ...CLOUDFLARE_FIELDS
      })
      expect(lastCommentBody()).toContain('🔄 Building')
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect(
    'records the id when Cloudflare does not answer, and leaves a newer comment alone',
    () =>
      Effect.gen(function* () {
        expect.assertions(2)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          {success: false, errors: [{code: 10000, message: 'Auth'}]},
          403
        )
        interceptRecent(['DE_newer', 'DE_mine'])

        yield* report(FAILURE, MOCK_DEPLOYMENT_ID)

        expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
          deploymentId: 'DE_mine',
          environment: 'preview',
          state: DeploymentStatusState.Failure,
          logUrl: CLOUDFLARE_FIELDS.logUrl,
          description: CLOUDFLARE_FIELDS.description
        })
        expect(updateComment).not.toHaveBeenCalled()
      }).pipe(Effect.provide(CommonLayer))
  )

  it.effect(
    'only warns when recording the failure fails, so the original stands',
    () =>
      Effect.gen(function* () {
        expect.assertions(2)

        vi.mocked(setGitHubDeploymentStatus).mockReturnValueOnce(
          Effect.fail(GitHubApiError.from(new Error('502 Bad Gateway')))
        )

        expect(yield* report(FAILURE)).toBeUndefined()
        expect(warning).toHaveBeenCalledWith(
          'deploy - Recording the failure on GitHub failed: 502 Bad Gateway'
        )
      }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('only warns when the comment fails to update', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      interceptRecent(['DE_mine'])
      vi.mocked(updateComment).mockReturnValueOnce(
        Effect.fail(GitHubApiError.from(new Error('502 Bad Gateway')))
      )

      yield* report(FAILURE)

      expect(warning).toHaveBeenCalledWith(
        'deploy - Updating the pull request comment failed: 502 Bad Gateway'
      )
    }).pipe(Effect.provide(CommonLayer))
  )

  it.effect('updates the comment when the newest-run check fails', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      interceptRecent([], 502)

      yield* report(FAILURE)

      expect(warning).toHaveBeenCalledWith(
        expect.stringMatching(
          /^deploy - Checking for a newer deployment failed: /
        )
      )
      expect(lastCommentBody()).toContain('❌ Failed')
    }).pipe(Effect.provide(CommonLayer))
  )
})
