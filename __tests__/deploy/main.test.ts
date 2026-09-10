import {setOutput} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {MockApi} from '@/tests/helpers/api.js'

import {execFileAsync} from '@/common/utils.js'
import {DeployLayer, run} from '@/deploy/main.js'
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

    describe('run effect', () => {
      describe('handles resolve', () => {
        beforeEach(() => {
          vi.mocked(execFileAsync).mockResolvedValue({
            stdout: 'success',
            stderr: ''
          })
          mockApi.interceptCloudflare(
            MOCK_API_PATH_DEPLOYMENTS,
            RESPONSE_DEPLOYMENTS,
            200
          )
        })

        /** `it.live`: status polling sleeps on the real clock. */
        it.live('success', () =>
          Effect.gen(function* () {
            expect.assertions(2)

            expect(yield* run).toBeUndefined()

            expect(setOutput).toHaveBeenCalledTimes(5)

            // TODO @andykenward add checks for setOutput
            mockApi.mockAgent.assertNoPendingInterceptors()
          }).pipe(Effect.provide(DeployLayer))
        )
      })
    })
  })
})
