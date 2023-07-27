import {setOutput, summary} from '@unlike/github-actions-core'
import * as execa from 'execa'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/index.js'
import RESPONSE_NOT_FOUND_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments-not-found.response.json'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  createCloudflareDeployment
} from '@/src/cloudflare/deployment/create.js'
import {MOCK_API_PATH_DEPLOYMENTS, setMockApi} from '@/tests/helpers/index.js'

vi.mock('execa')
vi.mock('@unlike/github-actions-core')
describe('createCloudflareDeployment', () => {
  describe('api calls', () => {
    let mockApi: MockApi
    beforeEach(() => {
      mockApi = setMockApi()
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
        createCloudflareDeployment()
      ).rejects.toThrowErrorMatchingInlineSnapshot('"Oh no!"')

      expect(execa.$).toHaveBeenCalledWith(
        [
          `npx wrangler@`,
          ` pages deploy `,
          ' --project-name=',
          ' --branch=',
          ' --commit-dirty=true --commit-hash=',
          ''
        ],
        process.env.npm_package_dependencies_wrangler,
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
        killed: false,
        cwd: '/path/to/cwd'
      })

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_NOT_FOUND_DEPLOYMENTS,
        404
      )

      await expect(
        createCloudflareDeployment()
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
        killed: false,
        cwd: '/path/to/cwd'
      })

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS,
        200
      )

      const deployment = await createCloudflareDeployment()

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
      expect(setOutput).toHaveBeenNthCalledWith(3, 'environment', 'production')
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
