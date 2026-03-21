import {setOutput} from '@actions/core'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {execAsync} from '@/common/utils.js'
import {run} from '@/deploy/main.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {MOCK_API_PATH_DEPLOYMENTS, setMockApi} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))
vi.mock(import('@/common/utils.js'))
vi.mock(import('@/common/github/environment.js'))
vi.mock(import('@/common/github/deployment/create.js'))
vi.mock(import('@/common/github/comment.js'))

describe('deploy', () => {
  describe('main', () => {
    let mockApi: MockApi

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

          expect(setOutput).toHaveBeenCalledTimes(5)

          // TODO @andykenward add checks for setOutput
          mockApi.mockAgent.assertNoPendingInterceptors()
        })
      })
    })
  })
})
