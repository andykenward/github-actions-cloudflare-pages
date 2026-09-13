import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubRestApi} from '@/common/github/api/paginate.js'
import {GitHubContext} from '@/common/github/context.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'
import {CommonInputs} from '@/common/inputs.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.github.com/deployments.json' with {type: 'json'}
import {getMockApi, MOCK_GITHUB_PATH_DEPLOYMENTS} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

const DeploymentsLayer = GitHubRestApi.layer.pipe(
  Layer.provideMerge(Layer.mergeAll(CommonInputs.layer, GitHubContext.layer))
)

/** The fields the action reads; decoding drops the rest of the REST record. */
const DEPLOYMENTS = RESPONSE_DEPLOYMENTS.map(
  ({node_id, environment, payload}) => ({node_id, environment, payload})
)

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('getGitHubDeployments', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect.each([
    {
      environment: 'preview',
      query: {
        ref: 'mock-github-ref-name',
        per_page: 100,
        environment: 'preview'
      }
    },
    {
      // Unset, the delete action lists every environment — so the parameter
      // must be left out, not sent as `environment=undefined`.
      environment: undefined,
      query: {ref: 'mock-github-ref-name', per_page: 100}
    }
  ])(
    'lists the branch deployments for github-environment $environment',
    ({environment, query}) => {
      // Without GITHUB_HEAD_REF the context's `branch` is GITHUB_REF_NAME
      // (`mock-github-ref-name`) but its `ref` is the payload's head ref
      // (`changes`), so the query shows which one deployments are listed by.
      vi.stubEnv('GITHUB_HEAD_REF', '')

      return Effect.gen(function* () {
        expect.assertions(1)

        mockApi.interceptGithubRest(
          {path: MOCK_GITHUB_PATH_DEPLOYMENTS, query},
          RESPONSE_DEPLOYMENTS
        )

        expect(yield* getGitHubDeployments({environment})).toStrictEqual(
          DEPLOYMENTS
        )
      }).pipe(Effect.provide(DeploymentsLayer))
    }
  )

  it.effect('fails naming the field a listed deployment lacks', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'mock-github-head-ref', per_page: 100}
        },
        RESPONSE_DEPLOYMENTS.map(({environment, payload}) => ({
          environment,
          payload
        }))
      )

      const error = yield* Effect.flip(
        getGitHubDeployments({environment: undefined})
      )

      expect(error._tag).toBe('GitHubApiError')
      expect(error.message).toContain('node_id')
    }).pipe(Effect.provide(DeploymentsLayer))
  )
})
