import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubRestApi} from '@/common/github/api/paginate.js'
import {CommonInputs} from '@/common/inputs.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.github.com/deployments.json' with {type: 'json'}
import {getMockApi, MOCK_GITHUB_PATH_DEPLOYMENTS} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

/** Built when run, so the token stubbed by `vitest.setup.ts` is read. */
const RestApiLayer = GitHubRestApi.layer.pipe(Layer.provide(CommonInputs.layer))

const listDeployments = Effect.gen(function* () {
  const github = yield* GitHubRestApi

  return yield* github.paginate('GET /repos/{owner}/{repo}/deployments', {
    owner: 'andykenward',
    repo: 'github-actions-cloudflare-pages',
    ref: 'feature',
    per_page: 1
  })
})

describe(GitHubRestApi, () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  it.effect('follows the Link header and returns every page', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      const [first, second] = RESPONSE_DEPLOYMENTS
      const page2 = `https://api.github.com${MOCK_GITHUB_PATH_DEPLOYMENTS}?ref=feature&per_page=1&page=2`

      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1},
          // Authenticated with the `github-token` input.
          headers: {authorization: 'token mock-github-token'}
        },
        [first],
        200,
        {link: `<${page2}>; rel="next", <${page2}>; rel="last"`}
      )
      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1, page: 2}
        },
        [second]
      )

      expect(yield* listDeployments).toStrictEqual(RESPONSE_DEPLOYMENTS)
    }).pipe(Effect.provide(RestApiLayer))
  )

  it.effect('fails with GitHubApiError carrying the response message', () =>
    Effect.gen(function* () {
      expect.assertions(3)

      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1}
        },
        {
          message: 'Resource not accessible by integration',
          documentation_url:
            'https://docs.github.com/rest/deployments/deployments#list-deployments',
          status: '403'
        },
        403
      )

      const error = yield* Effect.flip(listDeployments)

      expect(error._tag).toBe('GitHubApiError')
      expect(error.message).toBe('Resource not accessible by integration')
      expect(error.cause).toMatchObject({status: 403})
    }).pipe(Effect.provide(RestApiLayer))
  )
})
