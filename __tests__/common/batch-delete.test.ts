import * as core from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import {batchDelete} from '@/common/batch-delete.js'
import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {MutationDeleteGitHubDeploymentAndComment} from '@/common/github/deployment/delete.js'
import {MutationCreateGitHubDeploymentStatus} from '@/common/github/deployment/status.js'
import {PayloadV1Inputs} from '@/common/inputs.js'
import {CommonLayer} from '@/common/layer.js'
import {DEPLOYMENT} from '@/fixtures/github-deployment.js'
import {DeploymentStatusState} from '@/gql/graphql.js'
import RESPONSE_CLOUDFLARE_DEPLOYMENT_DELETE from '@/responses/api.cloudflare.com/pages/deployments/deployments-delete.response.json' with {type: 'json'}

import type {MockApi} from '../helpers/api.js'

import {
  MOCK_ACCOUNT_ID,
  MOCK_API_PATH_DEPLOYMENTS_DELETE,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME,
  setMockApi
} from '../helpers/api.js'

vi.mock(import('@actions/core'))

const TestLayer = Layer.mergeAll(CommonLayer, PayloadV1Inputs.layer)

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('batchDelete', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect('should delete a deployment with valid payload', () =>
    Effect.gen(function* () {
      expect.assertions(3)

      mockApi.interceptCloudflare<boolean>(
        MOCK_API_PATH_DEPLOYMENTS_DELETE,
        RESPONSE_CLOUDFLARE_DEPLOYMENT_DELETE,
        200,
        'DELETE'
      )

      mockApi.interceptGithub(
        {
          query: MutationCreateGitHubDeploymentStatus,
          variables: {
            environment: 'preview',
            deploymentId: 'DE_kwDOJn0nrM5U35aT',
            environmentUrl:
              'https://4834e1f5.cloudflare-pages-action-a5z.pages.dev',
            logUrl: getCloudflareLogEndpoint({
              id: MOCK_DEPLOYMENT_ID,
              projectName: MOCK_PROJECT_NAME,
              accountId: MOCK_ACCOUNT_ID
            }),
            state: DeploymentStatusState.Inactive
          }
        },
        {
          data: {
            createDeploymentStatus: {
              clientMutationId: null
            }
          }
        }
      )

      mockApi.interceptGithub(
        {
          query: MutationDeleteGitHubDeploymentAndComment,
          variables: {
            deploymentId: 'DE_kwDOJn0nrM5U35aT',
            commentId: 'IC_kwDOJn0nrM55B77z'
          }
        },
        {
          data: {
            deleteIssueComment: {
              clientMutationId: null
            },
            deleteDeployment: {
              clientMutationId: 'DE_kwDOJn0nrM5U35aT'
            }
          }
        }
      )

      expect(yield* batchDelete(DEPLOYMENT)).toStrictEqual({
        success: true,
        commentId: 'IC_kwDOJn0nrM55B77z',
        deploymentId: 'DE_kwDOJn0nrM5U35aT',
        environment: 'preview',
        environmentUrl: 'https://4834e1f5.cloudflare-pages-action-a5z.pages.dev'
      })

      expect(core.warning).not.toHaveBeenCalled()

      expect(core.info).toHaveBeenLastCalledWith(
        `delete - GitHub Deployment Deleted: DE_kwDOJn0nrM5U35aT`
      )
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect('returns a failed row and warns with the deployment id', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      expect(
        yield* batchDelete({...DEPLOYMENT, payload: 'not json'})
      ).toStrictEqual({
        success: false,
        error: 'Payload is not valid',
        environment: 'preview',
        deploymentId: 'DE_kwDOJn0nrM5U35aT'
      })

      expect(core.warning).toHaveBeenCalledWith(
        `delete - Error deleting deployment DE_kwDOJn0nrM5U35aT: Payload is not valid`
      )
    }).pipe(Effect.provide(TestLayer))
  )
})
