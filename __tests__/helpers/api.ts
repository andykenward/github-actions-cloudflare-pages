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
