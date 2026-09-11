import {MockAgent, setGlobalDispatcher} from 'undici'

import type {FetchResult} from '@/common/cloudflare/types.js'
import type {
  GraphqlResponse,
  RequestParams,
  Variables
} from '@/common/github/api/client.js'

export const setMockApi = () => {
  return getMockApi()
}

export const getMockApi = () => {
  const mockAgent = new MockAgent()
  mockAgent.disableNetConnect() // prevent actual requests
  setGlobalDispatcher(mockAgent) // enabled the mock client to intercept requests
  const mockPoolCloudflare = mockAgent.get(`https://api.cloudflare.com`)
  const mockPoolGitHub = mockAgent.get(`https://api.github.com`)

  const interceptCloudflare = <T = unknown>(
    path: string,
    response: FetchResult<T>,
    statusCode?: number,
    method: 'GET' | 'POST' | 'DELETE' = 'GET'
  ) => {
    return mockPoolCloudflare
      .intercept({
        path,
        method
      })
      .reply(statusCode || 200, response)
  }

  /**
   * For a reply `interceptCloudflare` can't give — an empty `204` body or a
   * network error: returns the interceptor for `.reply` / `.replyWithError`.
   */
  const interceptCloudflareRaw = (path: string, method: 'GET' | 'DELETE') =>
    mockPoolCloudflare.intercept({path, method})

  /**
   * A GitHub REST `GET`, as `GitHubRestApi.paginate` (Octokit) sends. undici
   * matches `query` exactly. The reply is typed JSON — Octokit parses a body
   * only then — plus any `responseHeaders` (e.g. `link`).
   */
  const interceptGithubRest = (
    request: {
      path: string
      query?: Record<string, unknown>
      headers?: Record<string, string>
    },
    body: object,
    statusCode = 200,
    responseHeaders: Record<string, string> = {}
  ) => {
    mockPoolGitHub
      .intercept({...request, method: 'GET'})
      .reply(statusCode, body, {
        headers: {
          'content-type': 'application/json; charset=utf-8',
          ...responseHeaders
        }
      })
  }

  const interceptGithub = <T = unknown, V extends Variables = Variables>(
    params: Omit<RequestParams<T, V>, 'options'>,
    response: GraphqlResponse<T>,
    statusCode?: number
  ) => {
    mockPoolGitHub
      .intercept({
        path: '/graphql',
        method: 'POST',
        body: JSON.stringify({
          query: params.query.toString(),
          variables: params.variables
        })
      })
      .reply(statusCode || 200, response)
  }

  return {
    mockAgent,
    interceptCloudflare,
    interceptCloudflareRaw,
    interceptGithub,
    interceptGithubRest
  }
}
export type MockApi = ReturnType<typeof getMockApi>

export const MOCK_ACCOUNT_ID = 'mock-cloudflare-account-id'
export const MOCK_PROJECT_NAME = 'mock-cloudflare-project-name'
export const MOCK_DEPLOYMENT_ID = 'mock-deployment-id'

export const MOCK_API_PATH_PROJECT = `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`
export const MOCK_API_PATH_DEPLOYMENTS = `${MOCK_API_PATH_PROJECT}/deployments`
export const MOCK_API_PATH_DEPLOYMENT = `${MOCK_API_PATH_DEPLOYMENTS}/${MOCK_DEPLOYMENT_ID}`
export const MOCK_API_PATH_DEPLOYMENTS_DELETE = `${MOCK_API_PATH_PROJECT}/deployments/${MOCK_DEPLOYMENT_ID}?force=true`

/** The GitHub REST path listing the test repository's deployments. */
export const MOCK_GITHUB_PATH_DEPLOYMENTS =
  '/repos/andykenward/github-actions-cloudflare-pages/deployments'
