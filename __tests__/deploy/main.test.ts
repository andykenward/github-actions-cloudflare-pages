/* eslint-disable vitest/no-commented-out-tests */

import {setOutput} from '@actions/core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {
  // MOCK_API_PATH,
  MOCK_API_PATH_DEPLOYMENTS,
  setMockApi
} from '@/tests/helpers/api.js'

import {execAsync} from '@/common/utils.js'
// import RESPONSE_PROJECT from '@/responses/api.cloudflare.com/pages/projects/project.response.json'
import {run} from '@/deploy/main.js'

vi.mock('@actions/core')
vi.mock('@/common/utils.js')
vi.mock('@/common/github/environment.js')
vi.mock('@/common/github/deployment/create.js')
vi.mock('@/common/github/comment.js')

describe('deploy', () => {
  describe('main', () => {
    let mockApi: MockApi
    const spySetOutput = vi.mocked(setOutput)

    beforeEach(() => {
      mockApi = setMockApi()
    })

    afterEach(async () => {
      mockApi.mockAgent.assertNoPendingInterceptors()

      await mockApi.mockAgent.close()
    })

    describe(run, () => {
      describe('handles resolve', () => {
        beforeEach(() => {
          vi.mocked(execAsync).mockResolvedValue({
            stdout: 'success',
            stderr: ''
          })
          // mockApi.interceptCloudflare(MOCK_API_PATH, RESPONSE_PROJECT, 200)
          mockApi.interceptCloudflare(
            MOCK_API_PATH_DEPLOYMENTS,
            RESPONSE_DEPLOYMENTS,
            200
          )
        })

        test('success', async () => {
          expect.assertions(2)

          const main = await run()

          expect(main).toBeUndefined()

          expect(spySetOutput).toHaveBeenCalledTimes(5)

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
})
