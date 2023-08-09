import {setOutput, summary} from '@unlike/github-actions-core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/index.js'
import RESPONSE_NOT_FOUND_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments-not-found.response.json'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  createCloudflareDeployment
} from '@/src/cloudflare/deployment/create.js'
import {execAsync} from '@/src/utils.js'
import {MOCK_API_PATH_DEPLOYMENTS, setMockApi} from '@/tests/helpers/index.js'

vi.mock('@/src/utils.js')
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
      expect.assertions(5)
      vi.mocked(execAsync).mockRejectedValue({stderr: 'Oh no!'})

      await expect(
        createCloudflareDeployment()
      ).rejects.toThrowErrorMatchingInlineSnapshot('"Oh no!"')

      expect(execAsync).toHaveBeenCalledWith(
        `npx wrangler@3.4.0 pages deploy mock-directory --project-name=mock-cloudflare-project-name --branch=mock-github-head-ref --commit-dirty=true --commit-hash=mock-github-sha`,
        {
          env: {
            [CLOUDFLARE_ACCOUNT_ID]: 'mock-cloudflare-account-id',
            [CLOUDFLARE_API_TOKEN]: 'mock-cloudflare-api-token'
          }
        }
      )

      expect(execAsync).toHaveBeenCalledTimes(1)

      expect(setOutput).not.toHaveBeenCalled()
      expect(summary.addTable).not.toHaveBeenCalled()
    })

    test('handles thrown error from getDeployments', async () => {
      expect.assertions(4)
      vi.mocked(execAsync).mockResolvedValue({
        stdout: 'success',
        stderr: ''
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
      expect(execAsync).toHaveBeenCalledTimes(1)
      expect(setOutput).not.toHaveBeenCalled()
      expect(summary.addTable).not.toHaveBeenCalled()
    })

    test('handles success', async () => {
      expect.assertions(11)
      vi.mocked(execAsync).mockResolvedValue({
        stdout: 'success',
        stderr: ''
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
