import * as core from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {GitHubGraphQLError} from '@/common/github/api/client.js'

import {batchDelete} from '@/common/batch-delete.js'
import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {PayloadV1Inputs} from '@/common/inputs.js'
import {CommonLayer} from '@/common/layer.js'
import {DEPLOYMENT} from '@/fixtures/github-deployment.js'
import {
  DeactivateAndDeleteGitHubDeploymentAndCommentDocument,
  DeploymentStatusState
} from '@/gql/graphql.js'
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

const ENVIRONMENT_URL = 'https://4834e1f5.cloudflare-pages-action-a5z.pages.dev'

const ROW = {
  commentId: 'IC_kwDOJn0nrM55B77z',
  deploymentId: 'DE_kwDOJn0nrM5U35aT',
  environment: 'preview',
  environmentUrl: ENVIRONMENT_URL
}

const errorAt = (field: string): GitHubGraphQLError => ({
  type: 'FORBIDDEN',
  path: [field],
  message: `${field} failed`
})

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('batchDelete', () => {
  let mockApi: MockApi

  /** The Cloudflare DELETE, then the one GitHub request that follows it. */
  const interceptDeletes = (errors?: GitHubGraphQLError[]): void => {
    mockApi.interceptCloudflare<boolean>(
      MOCK_API_PATH_DEPLOYMENTS_DELETE,
      RESPONSE_CLOUDFLARE_DEPLOYMENT_DELETE,
      200,
      'DELETE'
    )

    // Same key order as `batchDelete` sends: the body must match exactly.
    mockApi.interceptGithub(
      {
        query: DeactivateAndDeleteGitHubDeploymentAndCommentDocument,
        variables: {
          status: {
            deploymentId: 'DE_kwDOJn0nrM5U35aT',
            environment: 'preview',
            environmentUrl: ENVIRONMENT_URL,
            logUrl: getCloudflareLogEndpoint({
              id: MOCK_DEPLOYMENT_ID,
              projectName: MOCK_PROJECT_NAME,
              accountId: MOCK_ACCOUNT_ID
            }),
            state: DeploymentStatusState.Inactive,
            autoInactive: false
          },
          deployment: {id: 'DE_kwDOJn0nrM5U35aT'},
          comment: {id: 'IC_kwDOJn0nrM55B77z'}
        }
      },
      {
        data: {
          createDeploymentStatus: {clientMutationId: null},
          deleteDeployment: {clientMutationId: null},
          deleteIssueComment: {clientMutationId: null}
        },
        errors
      }
    )
  }

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect('deletes from Cloudflare, then GitHub in one request', () =>
    Effect.gen(function* () {
      expect.assertions(3)

      interceptDeletes()

      expect(yield* batchDelete(DEPLOYMENT)).toStrictEqual({
        ...ROW,
        success: true
      })

      expect(core.warning).not.toHaveBeenCalled()

      expect(core.info).toHaveBeenLastCalledWith(
        `delete - GitHub Deployment Deleted: DE_kwDOJn0nrM5U35aT`
      )
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect('fails the row when the status update errors', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      const errors = [
        errorAt('createDeploymentStatus'),
        errorAt('deleteDeployment')
      ]
      interceptDeletes(errors)

      expect(yield* batchDelete(DEPLOYMENT)).toStrictEqual({
        ...ROW,
        success: false,
        error: 'Updating GitHub deployment status failed'
      })
      expect(core.warning).toHaveBeenCalledWith(
        `delete - Error updating GitHub deployment status: ${JSON.stringify(errors)}`
      )
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect('only warns when a later field errors', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      const errors = [errorAt('deleteIssueComment')]
      interceptDeletes(errors)

      expect(yield* batchDelete(DEPLOYMENT)).toStrictEqual({
        ...ROW,
        success: true
      })
      expect(core.warning).toHaveBeenCalledWith(
        `delete - Error deleting GitHub deployment: ${JSON.stringify(errors)}`
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
