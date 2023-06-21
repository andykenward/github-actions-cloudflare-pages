import type {Interceptable} from 'undici'

import {MockAgent, setGlobalDispatcher} from 'undici'

export const getMockApi = (): {
  mockAgent: MockAgent
  mockPoolCloudflare: Interceptable
} => {
  const mockAgent = new MockAgent()
  mockAgent.disableNetConnect() // prevent actual requests
  setGlobalDispatcher(mockAgent) // enabled the mock client to intercept requests
  const mockPoolCloudflare = mockAgent.get(`https://api.cloudflare.com`)

  return {
    mockAgent,
    mockPoolCloudflare
  }
}
export type MockApi = ReturnType<typeof getMockApi>

const MOCK_ACCOUNT_ID = 'mock-accountId'
const MOCK_PROJECT_NAME = 'mock-projectName'

export const MOCK_API_PATH = `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`
export const MOCK_API_PATH_DEPLOYMENTS = `${MOCK_API_PATH}/deployments`
