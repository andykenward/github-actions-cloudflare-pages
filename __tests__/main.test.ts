import * as core from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import RESPONSE_NOT_FOUND from '@/responses/api.cloudflare.com/pages/projects/project-not-found.response.json'
import RESPONSE_PROJECT from '@/responses/api.cloudflare.com/pages/projects/project.response.json'
import RESPONSE_UNAUTHORIZED from '@/responses/api.cloudflare.com/unauthorized.response.json'
import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_API_TOKEN,
  ACTION_INPUT_PROJECT_NAME
} from '@/src/constants.js'
import {run} from '@/src/main.js'

import type {MockApi} from './helpers/api.js'
import {getMockApi} from './helpers/api.js'
import {setInputEnv} from './helpers/inputs.js'

const MOCK_ACCOUNT_ID = 'mock-account-id'
const MOCK_PROJECT_NAME = 'mock-project-name'
const MOCK_API_TOKEN = 'mock-api-token'

vi.mock('@unlike/github-actions-core')
describe('main', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = getMockApi()
  })

  afterEach(async () => {
    await mockApi.mockAgent.close()
  })

  describe('run', () => {
    describe('cloudflare project', () => {
      describe('handles resolve', () => {
        test('200 - cloudflare project', async () => {
          expect.assertions(1)

          setInputEnv(ACTION_INPUT_ACCOUNT_ID, MOCK_ACCOUNT_ID)
          setInputEnv(ACTION_INPUT_PROJECT_NAME, MOCK_PROJECT_NAME)
          setInputEnv(ACTION_INPUT_API_TOKEN, MOCK_API_TOKEN)
          mockApi.mockPoolCloudflare
            .intercept({
              path: `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`,
              method: `GET`
            })
            .reply(200, RESPONSE_PROJECT)

          const main = await run()

          expect(main).toMatchInlineSnapshot(`
            {
              "name": "NextJS Blog",
              "subdomain": "helloworld.pages.dev",
            }
          `)
          mockApi.mockAgent.assertNoPendingInterceptors()
        })
      })

      const REQUIRED_INPUTS = [
        ACTION_INPUT_ACCOUNT_ID,
        ACTION_INPUT_PROJECT_NAME,
        ACTION_INPUT_API_TOKEN
      ] as const

      const EACH_REQUIRED_INPUTS = REQUIRED_INPUTS.map(input => ({
        expected: input,
        inputs: REQUIRED_INPUTS.filter(a => a !== input)
      }))

      test.each(EACH_REQUIRED_INPUTS)(
        `throws error when required input $expected is undefined`,
        async ({expected, inputs}) => {
          expect.assertions(1)

          for (const input of inputs) {
            setInputEnv(input, input)
          }

          await expect(() => run()).rejects.toThrow(
            `Input required and not supplied: ${expected}`
          )
          mockApi.mockAgent.assertNoPendingInterceptors()
        }
      )

      describe('handles rejected', () => {
        test('401 - unauthorized to cloudflare', async () => {
          expect.assertions(2)

          setInputEnv(ACTION_INPUT_ACCOUNT_ID, MOCK_ACCOUNT_ID)
          setInputEnv(ACTION_INPUT_PROJECT_NAME, MOCK_PROJECT_NAME)
          setInputEnv(ACTION_INPUT_API_TOKEN, MOCK_API_TOKEN)
          mockApi.mockPoolCloudflare
            .intercept({
              path: `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`,
              method: `GET`
            })
            .reply(401, RESPONSE_UNAUTHORIZED)

          await expect(() => run()).rejects.toThrow(
            `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name) failed.`
          )
          expect(core.error).toHaveBeenCalledWith(
            'Cloudflare API: Authentication error [code: 10000]'
          )
          mockApi.mockAgent.assertNoPendingInterceptors()
        })

        test('404 - cloudflare project is not found', async () => {
          expect.assertions(2)

          setInputEnv(ACTION_INPUT_ACCOUNT_ID, MOCK_ACCOUNT_ID)
          setInputEnv(ACTION_INPUT_PROJECT_NAME, MOCK_PROJECT_NAME)
          setInputEnv(ACTION_INPUT_API_TOKEN, 'mock-api-token')
          mockApi.mockPoolCloudflare
            .intercept({
              path: `/client/v4/accounts/${MOCK_ACCOUNT_ID}/pages/projects/${MOCK_PROJECT_NAME}`,
              method: `GET`
            })
            .reply(404, RESPONSE_NOT_FOUND)

          await expect(() => run()).rejects.toThrow(
            `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name) failed.`
          )
          expect(core.error).toHaveBeenCalledWith(
            'Cloudflare API: Project not found. The specified project name does not match any of your existing projects. [code: 8000007]'
          )
          mockApi.mockAgent.assertNoPendingInterceptors()
        })
      })
    })
  })
})
