import {setOutput, summary} from '@unlike/github-actions-core'
import * as execa from 'execa'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {PagesDeployment} from '@/src/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/index.js'
import RESPONSE_NOT_FOUND_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments-not-found.response.json'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {
  createDeployment,
  getDeploymentAlias
} from '@/src/cloudflare/deployments.js'
import {CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN} from '@/src/constants.js'
import {
  MOCK_API_PATH_DEPLOYMENTS,
  setMockApi,
  stubRequiredInputEnv
} from '@/tests/helpers/index.js'

import PACKAGE_JSON from '../../package.json'

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
    describe('api calls', () => {
      let mockApi: MockApi
      beforeEach(() => {
        mockApi = setMockApi()
        // Set required inputs
        stubRequiredInputEnv()
      })
      afterEach(async () => {
        mockApi.mockAgent.assertNoPendingInterceptors()
        await mockApi.mockAgent.close()
      })

      test('handles thrown error from wrangler deploy', async () => {
        expect.assertions(9)
        // Mock $ execa rejects
        vi.mocked(execa.$).mockRejectedValue({stderr: 'Oh no!'})

        // Expect Cloudflare Api Token and Account Id to be undefined.
        expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
        expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

        await expect(
          createDeployment()
        ).rejects.toThrowErrorMatchingInlineSnapshot('"Oh no!"')

        expect(execa.$).toHaveBeenCalledWith(
          [
            `npx wrangler@${PACKAGE_JSON.dependencies.wrangler} pages deploy `,
            ' --project-name=',
            ' --branch=',
            ' --commit-dirty=true --commit-hash=',
            ''
          ],
          'mock-directory',
          'mock-cloudflare-project-name',
          'mock-github-head-ref',
          'mock-github-sha'
        )
        expect(execa.$).toHaveBeenCalledTimes(1)
        expect(process.env[CLOUDFLARE_API_TOKEN]).toStrictEqual(
          'mock-cloudflare-api-token'
        )
        expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toStrictEqual(
          'mock-cloudflare-account-id'
        )
        expect(setOutput).not.toHaveBeenCalled()
        expect(summary.addTable).not.toHaveBeenCalled()
      })

      test('handles thrown error from getDeployments', async () => {
        expect.assertions(4)
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

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_NOT_FOUND_DEPLOYMENTS,
          404
        )

        await expect(
          createDeployment()
        ).rejects.toThrowErrorMatchingInlineSnapshot(
          '"A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/deployments) failed."'
        )
        expect(execa.$).toHaveBeenCalledTimes(1)
        expect(setOutput).not.toHaveBeenCalled()
        expect(summary.addTable).not.toHaveBeenCalled()
      })

      test('handles success', async () => {
        expect.assertions(11)
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

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_DEPLOYMENTS,
          200
        )

        const deployment = await createDeployment()

        expect(deployment).toMatchSnapshot()
        expect(deployment.id).toMatchInlineSnapshot(
          '"206e215c-33b3-4ce4-adf4-7fc6c9b65483"'
        )

        expect(setOutput).toHaveBeenCalledTimes(4)
        expect(setOutput).toHaveBeenNthCalledWith(
          1,
          'id',
          '206e215c-33b3-4ce4-adf4-7fc6c9b65483'
        )
        expect(setOutput).toHaveBeenNthCalledWith(
          2,
          'url',
          'https://206e215c.cloudflare-pages-action-a5z.pages.dev'
        )
        expect(setOutput).toHaveBeenNthCalledWith(
          3,
          'environment',
          'production'
        )
        expect(setOutput).toHaveBeenNthCalledWith(
          4,
          'alias',
          'https://unknown-branch.cloudflare-pages-action-a5z.pages.dev'
        )

        expect(summary.addHeading).toHaveBeenCalledWith(
          `Cloudflare Pages Deployment`
        )
        expect(summary.addBreak).toHaveBeenCalledTimes(1)

        expect(summary.addTable).toHaveBeenCalledTimes(1)
        expect(summary.addTable).toHaveBeenCalledWith([
          [
            {
              data: 'Name',
              header: true
            },
            {
              data: 'Result',
              header: true
            }
          ],
          ['Environment:', `production`],
          [
            'Branch:',
            `<a href='https://github.com/unlike-ltd/github-actions-cloudflare-pages/tree/main'><code>main</code></a>`
          ],
          [
            'Commit Hash:',
            `<a href='https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/mock-github-sha'><code>mock-github-sha</code></a>`
          ],
          ['Commit Message:', `chore(deps-dev): update eslint packages`],
          ['Status:', `<strong>SUCCESS</strong>`],
          [
            'Preview URL:',
            `<a href='https://206e215c.cloudflare-pages-action-a5z.pages.dev'>https://206e215c.cloudflare-pages-action-a5z.pages.dev</a>`
          ],
          [
            'Branch Preview URL:',
            `<a href='https://unknown-branch.cloudflare-pages-action-a5z.pages.dev'>https://unknown-branch.cloudflare-pages-action-a5z.pages.dev</a>`
          ]
        ])
      })
    })
  })
})
