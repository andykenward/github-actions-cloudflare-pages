import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {GraphqlResponse} from '@/common/github/api/client.js'
import type {Environment} from '@/common/github/environment.js'
import type {CreateGitHubDeploymentMutation} from '@/gql/graphql.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {
  createGitHubDeployment,
  setGitHubDeploymentStatus
} from '@/common/github/deployment/create.js'
import {CommonLayer} from '@/common/layer.js'
import {
  CreateGitHubDeploymentDocument,
  CreateGitHubDeploymentStatusDocument,
  DeploymentStatusState
} from '@/gql/graphql.js'
import {MOCK_ACCOUNT_ID, getMockApi} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

const ENVIRONMENT: Environment = {
  id: 'EN_kwDOJn0nrM5D_l8n',
  name: 'preview',
  refId: 'REF_kwDOJn0nrK9yZWZzL2hlYWRzL21haW4'
}

const GITHUB_DEPLOYMENT_ID = 'DE_kwDOJn0nrM5U35aT'

const COMMENT_ID = 'IC_kwDOJn0nrM5vY7Xq'

/**
 * The JSON the delete action later decodes — written through `PayloadV3`, so
 * its keys come in the schema's order. No Cloudflare id or URL yet: wrangler
 * has not run.
 */
const PAYLOAD = `{"version":3,"commentId":"${COMMENT_ID}","cloudflare":{"accountId":"mock-cloudflare-account-id","projectName":"cloudflare-pages-action"}}`

const create = (commentId: string | undefined) =>
  createGitHubDeployment({
    cloudflare: {
      accountId: MOCK_ACCOUNT_ID,
      projectName: 'cloudflare-pages-action'
    },
    commentId,
    environment: ENVIRONMENT
  })

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('createGitHubDeployment', () => {
  let mockApi: MockApi

  /** Expects the `createDeployment` mutation recording `payload`. */
  const interceptCreateDeployment = (
    payload: string,
    response: GraphqlResponse<CreateGitHubDeploymentMutation>
  ) =>
    mockApi.interceptGithub(
      {
        query: CreateGitHubDeploymentDocument,
        variables: {
          input: {
            // The repository of the default `pull_request` test payload.
            repositoryId: 'MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=',
            refId: ENVIRONMENT.refId,
            environment: 'preview',
            description: 'Cloudflare Pages: cloudflare-pages-action',
            payload,
            autoMerge: false,
            requiredContexts: []
          }
        }
      },
      response
    )

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect.each([
    {commentId: COMMENT_ID, payload: PAYLOAD},
    {
      // A `push`, or a pull request that was closed: no comment was posted.
      commentId: undefined,
      payload:
        '{"version":3,"cloudflare":{"accountId":"mock-cloudflare-account-id","projectName":"cloudflare-pages-action"}}'
    }
  ])(
    'records the deployment as in progress (commentId: $commentId)',
    ({commentId, payload}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        // The interceptor matches the request body, so it pins the payload.
        interceptCreateDeployment(payload, {
          data: {createDeployment: {deployment: {id: GITHUB_DEPLOYMENT_ID}}}
        })
        mockApi.interceptGithub(
          {
            query: CreateGitHubDeploymentStatusDocument,
            variables: {
              input: {
                deploymentId: GITHUB_DEPLOYMENT_ID,
                environment: 'preview',
                state: DeploymentStatusState.InProgress,
                autoInactive: false
              }
            }
          },
          {data: {createDeploymentStatus: {clientMutationId: null}}}
        )

        expect(yield* create(commentId)).toBe(GITHUB_DEPLOYMENT_ID)
      }).pipe(Effect.provide(CommonLayer))
  )

  it.effect.each([
    {response: 'no createDeployment', data: {createDeployment: null}},
    {response: 'no deployment', data: {createDeployment: {deployment: null}}}
  ])(
    'fails without setting a status when the response has $response',
    ({data}) =>
      Effect.gen(function* () {
        expect.assertions(2)

        // No status interceptor: had one been sent, the unmatched request
        // would fail with a `GitHubApiError` instead.
        interceptCreateDeployment(PAYLOAD, {data})

        const error = yield* Effect.flip(create(COMMENT_ID))

        expect(error._tag).toBe('GitHubDeploymentError')
        expect(error.message).toBe(
          'GitHub Deployment: GitHub deployment id is required'
        )
      }).pipe(Effect.provide(CommonLayer))
  )

  it.effect(
    'fails with the GraphQL error when the token may not create deployments',
    () =>
      Effect.gen(function* () {
        expect.assertions(2)

        interceptCreateDeployment(PAYLOAD, {
          data: {createDeployment: null},
          errors: [
            {
              type: 'FORBIDDEN',
              path: ['createDeployment'],
              message: 'Resource not accessible by integration'
            }
          ]
        })

        const error = yield* Effect.flip(create(COMMENT_ID))

        expect(error._tag).toBe('GitHubApiError')
        expect(error.message).toContain(
          'Resource not accessible by integration'
        )
      }).pipe(Effect.provide(CommonLayer))
  )
})

// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('setGitHubDeploymentStatus', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect('records the Cloudflare deployment on the status', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      mockApi.interceptGithub(
        {
          query: CreateGitHubDeploymentStatusDocument,
          variables: {
            input: {
              deploymentId: GITHUB_DEPLOYMENT_ID,
              environment: 'preview',
              environmentUrl: 'https://206e215c.example.pages.dev',
              logUrl: 'https://dash.cloudflare.com/log',
              description: 'Cloudflare Pages Deployment: cf-id',
              state: DeploymentStatusState.Success,
              autoInactive: false
            }
          }
        },
        {data: {createDeploymentStatus: {clientMutationId: null}}}
      )

      expect(
        yield* setGitHubDeploymentStatus({
          deploymentId: GITHUB_DEPLOYMENT_ID,
          environment: 'preview',
          state: DeploymentStatusState.Success,
          environmentUrl: 'https://206e215c.example.pages.dev',
          logUrl: 'https://dash.cloudflare.com/log',
          description: 'Cloudflare Pages Deployment: cf-id'
        })
      ).toBeUndefined()
    }).pipe(Effect.provide(CommonLayer))
  )
})
