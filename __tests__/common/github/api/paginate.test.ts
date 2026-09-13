import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubRestApi, PageCountMax} from '@/common/github/api/paginate.js'
import {GitHubContext} from '@/common/github/context.js'
import {CommonInputs} from '@/common/inputs.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.github.com/deployments.json' with {type: 'json'}
import {getMockApi, MOCK_GITHUB_PATH_DEPLOYMENTS} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

/** Built when run, so the token and env stubbed by `vitest.setup.ts` are read. */
const RestApiLayer = GitHubRestApi.layer.pipe(
  Layer.provide(Layer.mergeAll(CommonInputs.layer, GitHubContext.layer))
)

const listDeployments = Effect.gen(function* () {
  const github = yield* GitHubRestApi

  return yield* github.paginate(MOCK_GITHUB_PATH_DEPLOYMENTS, {
    ref: 'feature',
    per_page: 1,
    // Left out of the query, not sent as `environment=undefined`.
    environment: undefined
  })
})

/** The URL of page `number` of the test listing. */
const page = (number: number) =>
  `https://api.github.com${MOCK_GITHUB_PATH_DEPLOYMENTS}?ref=feature&per_page=1&page=${number}`

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
          headers: {authorization: 'bearer mock-github-token'}
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
        [second],
        200,
        // The last page links back, but not on to a next one.
        {
          link: `<https://api.github.com${MOCK_GITHUB_PATH_DEPLOYMENTS}?ref=feature&per_page=1&page=1>; rel="prev"`
        }
      )

      expect(yield* listDeployments).toStrictEqual(RESPONSE_DEPLOYMENTS)
    }).pipe(Effect.provide(RestApiLayer))
  )

  it.effect('fails once PageCountMax pages still link on to a next', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // Two pages are fetched; the second still links on, so the third is
      // never requested — an interceptor for it would be left pending.
      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1}
        },
        [RESPONSE_DEPLOYMENTS[0]],
        200,
        {link: `<${page(2)}>; rel="next"`}
      )
      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1, page: 2}
        },
        [RESPONSE_DEPLOYMENTS[1]],
        200,
        {link: `<${page(3)}>; rel="next"`}
      )

      const error = yield* Effect.flip(listDeployments)

      expect(error).toMatchObject({
        _tag: 'GitHubApiError',
        message: `GitHub API listing ${MOCK_GITHUB_PATH_DEPLOYMENTS} still had pages after 2; narrow the query`
      })
    }).pipe(
      Effect.provide(Layer.succeed(PageCountMax, 2)),
      Effect.provide(RestApiLayer)
    )
  )

  it.effect('lists from GITHUB_API_URL', () => {
    // Stubbed before the layer reads it, i.e. before the effect below runs.
    vi.stubEnv('GITHUB_API_URL', 'https://github.example.com/api/v3')

    return Effect.gen(function* () {
      expect.assertions(1)

      mockApi.mockAgent
        .get('https://github.example.com')
        .intercept({
          path: `/api/v3${MOCK_GITHUB_PATH_DEPLOYMENTS}`,
          query: {ref: 'feature', per_page: 1},
          method: 'GET'
        })
        .reply(200, RESPONSE_DEPLOYMENTS)

      expect(yield* listDeployments).toStrictEqual(RESPONSE_DEPLOYMENTS)
    }).pipe(Effect.provide(RestApiLayer))
  })

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

  it.effect('fails with the status when a non-2xx body has no message', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1}
        },
        {},
        502
      )

      const error = yield* Effect.flip(listDeployments)

      expect(error._tag).toBe('GitHubApiError')
      expect(error.message).toBe('GitHub API request failed: 502 Bad Gateway')
    }).pipe(Effect.provide(RestApiLayer))
  )

  it.effect('fails when the response is not JSON', () =>
    Effect.gen(function* () {
      expect.assertions(3)

      mockApi.mockAgent
        .get('https://api.github.com')
        .intercept({
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1},
          method: 'GET'
        })
        .reply(502, '<html>Bad Gateway</html>')

      const error = yield* Effect.flip(listDeployments)

      expect(error._tag).toBe('GitHubApiError')
      expect(error.message).toBe(
        'GitHub API returned a non-JSON response (502)'
      )
      // The parse error is kept as the cause of the cause.
      // oxlint-disable-next-line typescript/no-unsafe-assignment
      expect(error.cause).toMatchObject({cause: expect.any(SyntaxError)})
    }).pipe(Effect.provide(RestApiLayer))
  )

  it.effect('fails when the response is not a list', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      mockApi.interceptGithubRest(
        {
          path: MOCK_GITHUB_PATH_DEPLOYMENTS,
          query: {ref: 'feature', per_page: 1}
        },
        {message: 'not a list'}
      )

      const error = yield* Effect.flip(listDeployments)

      expect(error._tag).toBe('GitHubApiError')
      expect(error.message).toBe(
        `GitHub API returned a non-array response (https://api.github.com${MOCK_GITHUB_PATH_DEPLOYMENTS}?ref=feature&per_page=1)`
      )
    }).pipe(Effect.provide(RestApiLayer))
  )
})
