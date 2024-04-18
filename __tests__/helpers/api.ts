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
    interceptGithub
  }
}
export type MockApi = ReturnType<typeof getMockApi>

const MOCK_ACCOUNT_ID = 'mock-cloudflare-account-id'
const MOCK_PROJECT_NAME = 'mock-cloudflare-project-name'

export const MOCK_API_PATH = `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`
export const MOCK_API_PATH_DEPLOYMENTS = `${MOCK_API_PATH}/deployments`
