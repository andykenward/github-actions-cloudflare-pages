import * as core from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import RESPONSE_PROJECT from '@/responses/api.cloudflare.com/pages/projects/project.response.json'
import {run} from '@/src/main.js'
import {
  getMockApi,
  MOCK_API_PATH,
  MOCK_API_PATH_DEPLOYMENTS,
  setRequiredInputEnv,
  setTestEnvVars
} from '@/tests/helpers/index.js'

vi.mock('@unlike/github-actions-core')
vi.mock('execa')
describe('main', () => {
  let mockApi: ReturnType<typeof getMockApi>
  const spySetOutput = vi.mocked(core.setOutput)

  beforeEach(() => {
    mockApi = getMockApi()
    setRequiredInputEnv()
    setTestEnvVars()
  })

  afterEach(async () => {
    await mockApi.mockAgent.close()
  })

  describe('run', () => {
    describe('handles resolve', () => {
      beforeEach(() => {
        mockApi.mockPoolCloudflare
          .intercept({
            path: MOCK_API_PATH,
            method: `GET`
          })
          .reply(200, RESPONSE_PROJECT)
        mockApi.mockPoolCloudflare
          .intercept({
            path: MOCK_API_PATH_DEPLOYMENTS,
            method: `GET`
          })
          .reply(200, RESPONSE_DEPLOYMENTS)
      })

      test('success', async () => {
        expect.assertions(2)

        const main = await run()

        expect(main).toMatchInlineSnapshot(`
          {
            "name": "NextJS Blog",
            "subdomain": "helloworld.pages.dev",
            "url": "https://206e215c.cloudflare-pages-action-a5z.pages.dev",
          }
        `)

        expect(spySetOutput).toHaveBeenCalledTimes(4)
        // TODO @andykenward add checks for setOutput
        mockApi.mockAgent.assertNoPendingInterceptors()
      })
    })

    // describe.skip('handles rejected', () => {
    //   test('401 - unauthorized to cloudflare', async () => {
    //     expect.assertions(2)

    //     mockApi.mockPoolCloudflare
    //       .intercept({
    //         path: `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`,
    //         method: `GET`
    //       })
    //       .reply(401, RESPONSE_UNAUTHORIZED)

    //     await expect(() => run()).rejects.toThrow(
    //       `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-accountId/pages/projects/mock-projectName) failed.`
    //     )
    //     expect(core.error).toHaveBeenCalledWith(
    //       'Cloudflare API: Authentication error [code: 10000]'
    //     )
    //     mockApi.mockAgent.assertNoPendingInterceptors()
    //   })

    //   test('404 - cloudflare project is not found', async () => {
    //     expect.assertions(2)

    //     mockApi.mockPoolCloudflare
    //       .intercept({
    //         path: `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`,
    //         method: `GET`
    //       })
    //       .reply(404, RESPONSE_NOT_FOUND)

    //     await expect(() => run()).rejects.toThrow(
    //       `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-accountId/pages/projects/mock-projectName) failed.`
    //     )
    //     expect(core.error).toHaveBeenCalledWith(
    //       'Cloudflare API: Project not found. The specified project name does not match any of your existing projects. [code: 8000007]'
    //     )
    //     mockApi.mockAgent.assertNoPendingInterceptors()
    //   })
    // })
  })
})
