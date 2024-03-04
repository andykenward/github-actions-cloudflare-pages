import {setFailed, setOutput} from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import RESPONSE_PROJECT from '@/responses/api.cloudflare.com/pages/projects/project.response.json'
import {run, SUPPORTED_EVENT_NAMES} from '@/src/main.js'
import {EVENT_NAMES} from '@/types/github/workflow-events.js'

import type {MockApi} from './helpers/api.js'

import {
  MOCK_API_PATH,
  MOCK_API_PATH_DEPLOYMENTS,
  setMockApi
} from './helpers/api.js'
import {stubTestEnvVars} from './helpers/env.js'

vi.mock('@unlike/github-actions-core')
vi.mock('@/src/utils.js')
vi.mock('@/src/github/environment.js')
vi.mock('@/src/github/deployment/create.js')
vi.mock('@/src/github/comment.js')
describe('main', () => {
  let mockApi: MockApi
  const spySetOutput = vi.mocked(setOutput)
  const spySetFailed = vi.mocked(setFailed)

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    // mockApi.mockAgent.assertNoPendingInterceptors()

    await mockApi.mockAgent.close()
  })

  describe('run', () => {
    describe('handles resolve', () => {
      beforeEach(() => {
        mockApi.interceptCloudflare(MOCK_API_PATH, RESPONSE_PROJECT, 200)
        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_DEPLOYMENTS,
          200
        )
      })

      test('success', async () => {
        expect.assertions(3)

        await expect(run()).resolves.toBeUndefined()

        expect(spySetOutput).toHaveBeenCalledTimes(4)
        expect(spySetFailed).not.toHaveBeenCalled()
        // TODO @andykenward add checks for setOutput
        mockApi.mockAgent.assertNoPendingInterceptors()
      })
    })

    describe('fails', () => {
      const NOT_SUPPORTED_EVENT_NAMES = EVENT_NAMES.filter(
        item => !SUPPORTED_EVENT_NAMES.has(item)
      )
      const TOTAL_NOT_SUPPORTED = 61

      describe('not supported github action event names', () => {
        /**
         * Fail test if the event names total changes.
         */
        test(`not supported total ${TOTAL_NOT_SUPPORTED}`, () => {
          expect.assertions(1)
          expect(NOT_SUPPORTED_EVENT_NAMES).toHaveLength(TOTAL_NOT_SUPPORTED)
        })
        test.each(NOT_SUPPORTED_EVENT_NAMES)(
          `not supported '%s'`,
          async eventName => {
            expect.assertions(3)
            stubTestEnvVars(eventName)
            await expect(run()).resolves.toBeUndefined()
            expect(spySetFailed).toHaveBeenCalledWith(
              `GitHub Action event name '${eventName}' not supported.`
            )
            expect(spySetFailed).toHaveBeenCalledOnce()
          }
        )
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
