import {beforeEach, describe, expect, test, vi} from 'vitest'

import RESPONSE_NOT_FOUND_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments-not-found.response.json'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {createDeployment} from '@/src/cloudflare/deployments.js'
import {CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN} from '@/src/constants.js'
import {setTestEnvVars} from '@/tests/helpers/env.js'
import {
  REQUIRED_INPUTS,
  setInputEnv,
  setRequiredInputEnv
} from '@/tests/helpers/inputs.js'

import {getMockApi} from '../helpers/api.js'

const EACH_REQUIRED_INPUTS = REQUIRED_INPUTS.map(input => ({
  expected: input,
  inputs: REQUIRED_INPUTS.filter(a => a !== input)
}))

const mock$ = vi.fn()

vi.mock('execa', () => ({
  get $() {
    return mock$
  }
}))

describe('createDeployment', () => {
  describe('environment variables', () => {
    test.each(EACH_REQUIRED_INPUTS)(
      `throws error when required input $expected is undefined`,
      async ({expected, inputs}) => {
        for (const input of inputs) {
          setInputEnv(input, input)
        }

        await expect(() => createDeployment()).rejects.toThrow(
          `Input required and not supplied: ${expected}`
        )

        expect(mock$).not.toHaveBeenCalled()
      }
    )

    test('throws error when branch is undefined', async () => {
      // Set required inputs
      setRequiredInputEnv()

      expect(process.env.GITHUB_HEAD_REF).toBeUndefined()
      expect(process.env.GITHUB_REF_NAME).toBeUndefined()

      await expect(createDeployment()).rejects.toThrow(
        `Create Deployment: branch is undefined`
      )

      expect(process.env.GITHUB_HEAD_REF).toBeUndefined()
      expect(process.env.GITHUB_REF_NAME).toBeUndefined()
      expect(mock$).not.toHaveBeenCalled()
    })

    test('throws error when commitHash is undefined', async () => {
      expect.assertions(4)
      setRequiredInputEnv()
      setTestEnvVars()
      delete process.env.GITHUB_SHA

      expect(process.env.GITHUB_SHA).toBeUndefined()

      await expect(createDeployment()).rejects.toThrow(
        `Create Deployment: commitHash is undefined`
      )
      expect(mock$).not.toHaveBeenCalled()
      expect(process.env.GITHUB_SHA).toBeUndefined()
    })
  })

  describe('api calls', () => {
    let mockApi: ReturnType<typeof getMockApi>
    beforeEach(() => {
      mockApi = getMockApi()
      // Set required inputs
      setRequiredInputEnv()
      // Set Env vars
      setTestEnvVars()
    })

    test('handles thrown error from wrangler deploy', async () => {
      expect.assertions(7)
      // Mock $ execa rejects
      mock$.mockRejectedValue({stderr: 'Oh no!'})

      // Expect Cloudflare Api Token and Account Id to be undefined.
      expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
      expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

      await expect(createDeployment()).rejects.toThrow(`Oh no!`)

      expect(mock$).toHaveBeenCalledWith(
        [
          'npx wrangler pages deploy ',
          ' --project-name=',
          ' --branch=',
          ' --commit-dirty=true --commit-hash=',
          ''
        ],
        'mock-directory',
        'mock-projectName',
        'mock-github-ref-name',
        'mock-github-sha'
      )
      expect(mock$).toHaveBeenCalledTimes(1)
      expect(process.env[CLOUDFLARE_API_TOKEN]).toStrictEqual('mock-apiToken')
      expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toStrictEqual('mock-accountId')
    })

    test('handles thrown error from getDeployments', async () => {
      expect.assertions(2)
      mock$.mockResolvedValue({stdout: 'mock-deployment-id'})
      mockApi.mockPoolCloudflare
        .intercept({
          path: `/client/v4/accounts/mock-accountId/pages/projects/mock-projectName/deployments`,
          method: `GET`
        })
        .reply(404, RESPONSE_NOT_FOUND_DEPLOYMENTS)

      await expect(createDeployment()).rejects.toThrow(
        `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-accountId/pages/projects/mock-projectName/deployments) failed.`
      )
      expect(mock$).toHaveBeenCalledTimes(1)
      mockApi.mockAgent.assertNoPendingInterceptors()
    })

    test('handles success', async () => {
      expect.assertions(2)
      mock$.mockResolvedValue({stdout: 'mock-deployment-id'})
      mockApi.mockPoolCloudflare
        .intercept({
          path: `/client/v4/accounts/mock-accountId/pages/projects/mock-projectName/deployments`,
          method: `GET`
        })
        .reply(200, RESPONSE_DEPLOYMENTS)

      const deployment = await createDeployment()

      expect(deployment).toMatchSnapshot()
      expect(deployment.id).toMatchInlineSnapshot(
        '"206e215c-33b3-4ce4-adf4-7fc6c9b65483"'
      )
      mockApi.mockAgent.assertNoPendingInterceptors()
    })
  })
})
