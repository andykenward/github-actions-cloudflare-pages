import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubRestApi} from '@/common/github/api/paginate.js'
import {GitHubContext} from '@/common/github/context.js'
import {getGitHubDeployments} from '@/common/github/deployment/get.js'
import {CommonInputs} from '@/common/inputs.js'
import {INPUT_KEY_GITHUB_ENVIRONMENT} from '@/input-keys'
import RESPONSE_DEPLOYMENTS from '@/responses/api.github.com/deployments.json' with {type: 'json'}
import {getMockApi, MOCK_GITHUB_PATH_DEPLOYMENTS} from '@/tests/helpers/api.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

vi.mock(import('@actions/core'))

const DeploymentsLayer = GitHubRestApi.layer.pipe(
  Layer.provideMerge(Layer.mergeAll(CommonInputs.layer, GitHubContext.layer))
)

// An Effect value, not a function, so the title is a string.
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
      environment: '',
      query: {ref: 'mock-github-ref-name', per_page: 100}
    }
  ])(
    'lists the branch deployments for github-environment $environment',
    ({environment, query}) => {
      stubInputEnv(INPUT_KEY_GITHUB_ENVIRONMENT, environment)
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

        expect(yield* getGitHubDeployments).toStrictEqual(RESPONSE_DEPLOYMENTS)
      }).pipe(Effect.provide(DeploymentsLayer))
    }
  )
})
