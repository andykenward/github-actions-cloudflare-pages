import * as core from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {GitHubGraphQLError} from '@/common/github/api/client.js'

import {batchDelete} from '@/common/batch-delete.js'
import {PayloadV1Inputs} from '@/common/inputs.js'
import {CommonLayer} from '@/common/layer.js'
import {DEPLOYMENT} from '@/fixtures/github-deployment.js'
import {
  DeactivateAndDeleteGitHubDeploymentAndCommentDocument,
  DeactivateAndDeleteGitHubDeploymentDocument,
  DeploymentStatusState
} from '@/gql/graphql.js'
import RESPONSE_CLOUDFLARE_DEPLOYMENT_DELETE from '@/responses/api.cloudflare.com/pages/deployments/deployments-delete.response.json' with {type: 'json'}
import RESPONSE_CLOUDFLARE_UNAUTHORIZED from '@/responses/api.cloudflare.com/unauthorized.response.json' with {type: 'json'}

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

  /**
   * The Cloudflare DELETE, then the one GitHub request that follows it — with
   * the comment deletion only when the deployment has a comment.
   */
  const interceptDeletes = ({
    errors,
    withComment = true
  }: {errors?: GitHubGraphQLError[]; withComment?: boolean} = {}): void => {
    mockApi.interceptCloudflare<boolean>(
      MOCK_API_PATH_DEPLOYMENTS_DELETE,
      RESPONSE_CLOUDFLARE_DEPLOYMENT_DELETE,
      200,
      'DELETE'
    )

    // Same key order as `batchDelete` sends: the body must match exactly.
    const variables = {
      status: {
        deploymentId: 'DE_kwDOJn0nrM5U35aT',
        environment: 'preview',
        environmentUrl: ENVIRONMENT_URL,
        logUrl:
          'https://dash.cloudflare.com/mock-cloudflare-account-id/pages/view/mock-cloudflare-project-name/mock-deployment-id',
        state: DeploymentStatusState.Inactive,
        autoInactive: false
      },
      deployment: {id: 'DE_kwDOJn0nrM5U35aT'}
    }
    const data = {
      createDeploymentStatus: {clientMutationId: null},
      deleteDeployment: {clientMutationId: null}
    }

    if (withComment) {
      mockApi.interceptGithub(
        {
          query: DeactivateAndDeleteGitHubDeploymentAndCommentDocument,
          variables: {...variables, comment: {id: 'IC_kwDOJn0nrM55B77z'}}
        },
        {data: {...data, deleteIssueComment: {clientMutationId: null}}, errors}
      )
    } else {
      mockApi.interceptGithub(
        {query: DeactivateAndDeleteGitHubDeploymentDocument, variables},
        {data, errors}
      )
    }
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

  it.effect('leaves comments alone for a deployment without one', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      interceptDeletes({withComment: false})

      expect(
        yield* batchDelete({
          ...DEPLOYMENT,
          payload: {
            cloudflare: {
              id: MOCK_DEPLOYMENT_ID,
              projectName: MOCK_PROJECT_NAME,
              accountId: MOCK_ACCOUNT_ID
            },
            url: ENVIRONMENT_URL
          }
        })
      ).toStrictEqual({...ROW, commentId: undefined, success: true})
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect('fails the row when the status update errors', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      const errors = [
        errorAt('createDeploymentStatus'),
        errorAt('deleteDeployment')
      ]
      interceptDeletes({errors})

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
      interceptDeletes({errors})

      expect(yield* batchDelete(DEPLOYMENT)).toStrictEqual({
        ...ROW,
        success: true
      })
      expect(core.warning).toHaveBeenCalledWith(
        `delete - Error deleting GitHub deployment: ${JSON.stringify(errors)}`
      )
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect('fails the row when the whole GitHub request errors', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      // No `path`: GitHub ran none of the mutations.
      const errors = [
        {type: 'RATE_LIMITED', message: 'API rate limit exceeded'}
      ]
      interceptDeletes({errors})

      expect(yield* batchDelete(DEPLOYMENT)).toStrictEqual({
        ...ROW,
        success: false,
        error: 'Deleting GitHub deployment failed'
      })
      expect(core.warning).toHaveBeenCalledWith(
        `delete - Error deleting GitHub deployment: ${JSON.stringify(errors)}`
      )
    }).pipe(Effect.provide(TestLayer))
  )

  it.effect(
    'keeps the GitHub deployment when the Cloudflare delete fails',
    () =>
      Effect.gen(function* () {
        expect.assertions(2)

        // No GitHub intercept: net connect is disabled, so a GitHub request
        // would fail the row with a different error.
        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS_DELETE,
          RESPONSE_CLOUDFLARE_UNAUTHORIZED,
          403,
          'DELETE'
        )

        expect(yield* batchDelete(DEPLOYMENT)).toStrictEqual({
          ...ROW,
          success: false,
          error: 'Deleting Cloudflare deployment failed'
        })
        // The reason Cloudflare gave.
        expect(core.error).toHaveBeenCalledWith(
          expect.stringContaining('Authentication error [code: 10000]')
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
