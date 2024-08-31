import * as core from '@actions/core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {DeploymentState, DeploymentStatusState} from '@/gql/graphql.js'
import RESPONSE_CLOUDFLARE_DEPLOYMENT_DELETE from '@/responses/api.cloudflare.com/pages/deployments/deployments-delete.response.json'

import {batchDelete} from '@/common/batch-delete.js'
import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {MutationDeleteGitHubDeploymentAndComment} from '@/common/github/deployment/delete.js'
import {MutationCreateGitHubDeploymentStatus} from '@/common/github/deployment/status.js'
import {DEPLOYMENT} from '@/fixtures/github-deployment.js'

import type {MockApi} from '../helpers/api.js'

import {
  MOCK_ACCOUNT_ID,
  MOCK_API_PATH_DEPLOYMENTS_DELETE,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME,
  setMockApi
} from '../helpers/api.js'

vi.mock('@actions/core')

describe('batch-delete', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  test('should delete a deployment with valid payload', async () => {
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
            deploymentStatus: {
              deployment: {
                state: DeploymentState.Inactive,
                id: 'DE_kwDOJn0nrM5U35aT',
                environment: 'preview'
              }
            }
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
          deleteDeployment: {
            clientMutationId: 'DE_kwDOJn0nrM5U35aT'
          }
        }
      }
    )

    await expect(batchDelete(DEPLOYMENT)).resolves.toStrictEqual({
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
  })
})
