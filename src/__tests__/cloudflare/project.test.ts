import type {Project} from '@cloudflare/types'
import {MockAgent, setGlobalDispatcher} from 'undici'
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
  vi
} from 'vitest'

import {PROJECT_RESPONSE} from '../../cloudflare/__mocks__/project'
import {getProject} from '../../cloudflare/project'
import type {FetchResult} from '../../cloudflare/types'
import {ACTION_INPUT_API_TOKEN} from '../../cloudflare/utils'
import {setInputEnv} from '../helpers'

vi.mock('../../cloudflare/endpoints')

describe('getProject', () => {
  /** Mock Fetch request that use undici. */
  let mockAgent: MockAgent
  beforeEach(() => {
    mockAgent = new MockAgent()
    mockAgent.disableNetConnect() // prevent actual requests
    setGlobalDispatcher(mockAgent) // enabled the mock client to intercept requests
  })
  afterEach(async () => {
    vi.clearAllMocks()
    await mockAgent.close()
  })

  test('returns project response', async () => {
    setInputEnv(ACTION_INPUT_API_TOKEN, 'mock-api-token')

    const mockPoolCloudflare = mockAgent.get(`https://api.cloudflare.com`)
    mockPoolCloudflare
      .intercept({
        path: `/client/v4/accounts/mock-account-id/pages/projects/mock-project-name`,
        method: `GET`
      })
      .reply<FetchResult<Project>>(200, {
        success: true,
        errors: [],
        messages: [],
        result: PROJECT_RESPONSE
      })

    expectTypeOf(getProject).returns.resolves.toMatchTypeOf<Project>()

    await expect(getProject()).resolves.toStrictEqual(PROJECT_RESPONSE)
  })

  // test('throws error when response not succes', () => {})
})
