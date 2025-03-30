import {info, setOutput, summary} from '@actions/core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import RESPONSE_NOT_FOUND_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments-not-found.response.json'
import RESPONSE_DEPLOYMENTS_IDLE from '@/responses/api.cloudflare.com/pages/deployments/deployments.idle.response.json'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json'
import {MOCK_API_PATH_DEPLOYMENTS, setMockApi} from '@/tests/helpers/api.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  createCloudflareDeployment
} from '@/common/cloudflare/deployment/create.js'
import {execAsync} from '@/common/utils.js'
import {INPUT_KEY_WORKING_DIRECTORY} from '@/input-keys'

vi.mock('@/common/utils.js')
vi.mock('@actions/core')

describe('createCloudflareDeployment', () => {
  describe('api calls', () => {
    let mockApi: MockApi

    beforeEach(() => {
      vi.useFakeTimers({
        shouldAdvanceTime: true
      })
      mockApi = setMockApi()
    })

    afterEach(async () => {
      mockApi.mockAgent.assertNoPendingInterceptors()
      await mockApi.mockAgent.close()
      vi.mocked(execAsync).mockReset()
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    })

    test('handles thrown error from wrangler deploy', async () => {
      expect.assertions(10)

      vi.mocked(execAsync).mockRejectedValueOnce({stderr: 'Oh no!', stdout: ''})

      // Expect Cloudflare Api Token and Account Id to be undefined.
      expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
      expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

      await expect(
        createCloudflareDeployment({
          accountId: 'mock-cloudflare-account-id',
          projectName: 'mock-cloudflare-project-name',
          directory: 'mock-directory'
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: Oh no!]`)

      expect(execAsync).toHaveBeenCalledWith(
        `npx wrangler@^4.6.0 pages deploy mock-directory --project-name=mock-cloudflare-project-name --branch=mock-github-head-ref --commit-dirty=true --commit-hash=mock-github-sha`,
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          env: expect.objectContaining({
            CLOUDFLARE_ACCOUNT_ID: 'mock-cloudflare-account-id',
            CLOUDFLARE_API_TOKEN: 'mock-cloudflare-api-token'
          }),
          cwd: ''
        }
      )

      expect(execAsync).toHaveBeenCalledTimes(1)
      expect(info).not.toHaveBeenCalled()
      expect(process.env[CLOUDFLARE_API_TOKEN]).toBe(
        'mock-cloudflare-api-token'
      )
      expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBe(
        'mock-cloudflare-account-id'
      )

      expect(setOutput).not.toHaveBeenCalled()
      expect(summary.addTable).not.toHaveBeenCalled()
    })

    test('handles thrown error from getDeployments', async () => {
      expect.assertions(5)

      vi.mocked(execAsync).mockResolvedValueOnce({
        stdout: 'success',
        stderr: ''
      })

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_NOT_FOUND_DEPLOYMENTS,
        404
      )

      await expect(
        createCloudflareDeployment({
          accountId: 'mock-cloudflare-account-id',
          projectName: 'mock-cloudflare-project-name',
          directory: 'mock-directory'
        })
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `[ParseError: A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/deployments) failed.]`
      )
      expect(execAsync).toHaveBeenCalledTimes(1)
      expect(info).toHaveBeenLastCalledWith('success')
      expect(setOutput).not.toHaveBeenCalled()
      expect(summary.addTable).not.toHaveBeenCalled()
    })

    test('handles success', async () => {
      expect.assertions(15)

      stubInputEnv(INPUT_KEY_WORKING_DIRECTORY)

      vi.mocked(execAsync).mockResolvedValueOnce({
        stdout: 'success',
        stderr: ''
      })

      mockApi
        .interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_DEPLOYMENTS_IDLE,
          200
        )
        .times(2)

      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS,
        200
      )

      const {deployment, wranglerOutput} = await createCloudflareDeployment({
        accountId: 'mock-cloudflare-account-id',
        projectName: 'mock-cloudflare-project-name',
        directory: 'mock-directory',
        workingDirectory: 'mock-working-directory'
      })
      // vi.advanceTimersByTime(2000)

      expect(execAsync).toHaveBeenCalledWith(
        `npx wrangler@^4.6.0 pages deploy mock-directory --project-name=mock-cloudflare-project-name --branch=mock-github-head-ref --commit-dirty=true --commit-hash=mock-github-sha`,
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          env: expect.objectContaining({
            CLOUDFLARE_ACCOUNT_ID: 'mock-cloudflare-account-id',
            CLOUDFLARE_API_TOKEN: 'mock-cloudflare-api-token'
          }),
          cwd: 'mock-working-directory'
        }
      )

      expect(wranglerOutput).toMatchInlineSnapshot(`"success"`)
      expect(deployment).toMatchSnapshot()
      expect(deployment.id).toMatchInlineSnapshot(
        '"206e215c-33b3-4ce4-adf4-7fc6c9b65483"'
      )
      expect(info).toHaveBeenLastCalledWith('success')

      expect(setOutput).toHaveBeenCalledTimes(5)
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
      expect(setOutput).toHaveBeenNthCalledWith(5, 'wrangler', 'success')

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
          `<a href='https://github.com/andykenward/github-actions-cloudflare-pages/tree/main'><code>main</code></a>`
        ],
        [
          'Commit Hash:',
          `<a href='https://github.com/andykenward/github-actions-cloudflare-pages/commit/mock-github-sha'><code>mock-github-sha</code></a>`
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
        ],
        ['Wrangler Output:', `success`]
      ])
    })
  })
})
