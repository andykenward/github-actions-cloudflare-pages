import * as core from '@unlike/github-actions-core'
import * as execa from 'execa'
import {beforeEach, describe, expect, test, vi} from 'vitest'

import type {PagesDeployment} from '@/src/cloudflare/types.js'
import RESPONSE_NOT_FOUND_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments-not-found.response.json'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {
  createDeployment,
  getDeploymentAlias
} from '@/src/cloudflare/deployments.js'
import {CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN} from '@/src/constants.js'
import {
  getMockApi,
  MOCK_API_PATH_DEPLOYMENTS,
  REQUIRED_INPUTS,
  setInputEnv,
  setRequiredInputEnv,
  setTestEnvVars
} from '@/tests/helpers/index.js'

import PACKAGE_JSON from '../../package.json'

const EACH_REQUIRED_INPUTS = REQUIRED_INPUTS.map(input => ({
  expected: input,
  inputs: REQUIRED_INPUTS.filter(a => a !== input)
}))

vi.mock('execa')
vi.mock('@unlike/github-actions-core')
describe('deployments', () => {
  describe('getDeploymentAlias', () => {
    test('returns deployment url when aliases is null', () => {
      const alias = getDeploymentAlias({
        aliases: null,
        url: 'https://helloworld.pages.dev'
      } as PagesDeployment)

      expect(alias).toStrictEqual('https://helloworld.pages.dev')
    })

    test('returns deployment url when aliases is empty array', () => {
      const alias = getDeploymentAlias({
        aliases: [],
        url: 'https://helloworld.pages.dev'
      } as unknown as PagesDeployment)

      expect(alias).toStrictEqual('https://helloworld.pages.dev')
    })

    test('returns deployment first alias when aliases is not empty array', () => {
      const alias = getDeploymentAlias({
        aliases: ['https://helloworld-alias.pages.dev'],
        url: 'https://helloworld.pages.dev'
      } as PagesDeployment)

      expect(alias).toStrictEqual('https://helloworld-alias.pages.dev')
    })
  })

  describe('createDeployment', () => {
    const spySetOutput = vi.mocked(core.setOutput)

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

          expect(execa.$).not.toHaveBeenCalled()
          expect(spySetOutput).not.toHaveBeenCalled()
        }
      )

      test('throws error when branch is undefined', async () => {
        // Set required inputs
        setRequiredInputEnv()
        // For CI test runner we have to delete the env vars
        delete process.env.GITHUB_HEAD_REF
        delete process.env.GITHUB_REF_NAME

        expect(process.env.GITHUB_HEAD_REF).toBeUndefined()
        expect(process.env.GITHUB_REF_NAME).toBeUndefined()

        await expect(createDeployment()).rejects.toThrow(
          `Create Deployment: branch is undefined`
        )

        expect(process.env.GITHUB_HEAD_REF).toBeUndefined()
        expect(process.env.GITHUB_REF_NAME).toBeUndefined()
        expect(execa.$).not.toHaveBeenCalled()
        expect(spySetOutput).not.toHaveBeenCalled()
      })

      test('throws error when commitHash is undefined', async () => {
        expect.assertions(5)
        setRequiredInputEnv()
        setTestEnvVars()
        delete process.env.GITHUB_SHA

        expect(process.env.GITHUB_SHA).toBeUndefined()

        await expect(createDeployment()).rejects.toThrow(
          `Create Deployment: commitHash is undefined`
        )
        expect(execa.$).not.toHaveBeenCalled()
        expect(process.env.GITHUB_SHA).toBeUndefined()
        expect(spySetOutput).not.toHaveBeenCalled()
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
        expect.assertions(8)
        // Mock $ execa rejects
        vi.mocked(execa.$).mockRejectedValue({stderr: 'Oh no!'})

        // Expect Cloudflare Api Token and Account Id to be undefined.
        expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
        expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

        await expect(createDeployment()).rejects.toThrow(`Oh no!`)

        expect(execa.$).toHaveBeenCalledWith(
          [
            `npx wrangler@${PACKAGE_JSON.dependencies.wrangler} pages deploy `,
            ' --project-name=',
            ' --branch=',
            ' --commit-dirty=true --commit-hash=',
            ''
          ],
          'mock-directory',
          'mock-projectName',
          'mock-github-head-ref',
          'mock-github-sha'
        )
        expect(execa.$).toHaveBeenCalledTimes(1)
        expect(process.env[CLOUDFLARE_API_TOKEN]).toStrictEqual('mock-apiToken')
        expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toStrictEqual(
          'mock-accountId'
        )
        expect(spySetOutput).not.toHaveBeenCalled()
      })

      test('handles thrown error from getDeployments', async () => {
        expect.assertions(3)
        vi.mocked(execa.$).mockResolvedValue({
          isCanceled: false,
          command: '',
          escapedCommand: '',
          exitCode: 0,
          stdout: 'success',
          stderr: '',
          failed: false,
          timedOut: false,
          killed: false
        })
        mockApi.mockPoolCloudflare
          .intercept({
            path: MOCK_API_PATH_DEPLOYMENTS,
            method: `GET`
          })
          .reply(404, RESPONSE_NOT_FOUND_DEPLOYMENTS)

        await expect(createDeployment()).rejects.toThrow(
          `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-accountId/pages/projects/mock-projectName/deployments) failed.`
        )
        expect(execa.$).toHaveBeenCalledTimes(1)
        expect(spySetOutput).not.toHaveBeenCalled()
        mockApi.mockAgent.assertNoPendingInterceptors()
      })

      test('handles success', async () => {
        expect.assertions(7)
        vi.mocked(execa.$).mockResolvedValue({
          isCanceled: false,
          command: '',
          escapedCommand: '',
          exitCode: 0,
          stdout: 'success',
          stderr: '',
          failed: false,
          timedOut: false,
          killed: false
        })
        mockApi.mockPoolCloudflare
          .intercept({
            path: MOCK_API_PATH_DEPLOYMENTS,
            method: `GET`
          })
          .reply(200, RESPONSE_DEPLOYMENTS)

        const deployment = await createDeployment()

        expect(deployment).toMatchSnapshot()
        expect(deployment.id).toMatchInlineSnapshot(
          '"206e215c-33b3-4ce4-adf4-7fc6c9b65483"'
        )

        expect(spySetOutput).toHaveBeenCalledTimes(4)
        expect(spySetOutput).toHaveBeenNthCalledWith(
          1,
          'id',
          '206e215c-33b3-4ce4-adf4-7fc6c9b65483'
        )
        expect(spySetOutput).toHaveBeenNthCalledWith(
          2,
          'url',
          'https://206e215c.cloudflare-pages-action-a5z.pages.dev'
        )
        expect(spySetOutput).toHaveBeenNthCalledWith(
          3,
          'environment',
          'production'
        )
        expect(spySetOutput).toHaveBeenNthCalledWith(
          4,
          'alias',
          'https://unknown-branch.cloudflare-pages-action-a5z.pages.dev'
        )

        mockApi.mockAgent.assertNoPendingInterceptors()
      })
    })
  })
})
