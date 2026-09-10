import {setOutput} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {GetEnvironmentQuery} from '@/gql/graphql.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubApi} from '@/common/github/api/client.js'
import {addComment} from '@/common/github/comment.js'
import {QueryGetEnvironment} from '@/common/github/environment.js'
import {execFileAsync} from '@/common/utils.js'
import {DeployLayer, run} from '@/deploy/main.js'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {MOCK_API_PATH_DEPLOYMENTS, setMockApi} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))
vi.mock(import('@/common/utils.js'))
vi.mock(import('@/common/github/deployment/create.js'))
vi.mock(import('@/common/github/comment.js'))

const REF_ID = 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='

/** `checkEnvironment`'s answer when the environment has not been created. */
const ENVIRONMENT_MISSING: {data: GetEnvironmentQuery} = {
  data: {repository: {environment: null, ref: {id: REF_ID}}}
}

describe('deploy', () => {
  describe('main', () => {
    let mockApi: MockApi

    beforeEach(() => {
      mockApi = setMockApi()
    })

    afterEach(async () => {
      mockApi.mockAgent.assertNoPendingInterceptors()
      await mockApi.mockAgent.close()
      vi.mocked(execFileAsync).mockReset()
    })

    describe('run effect', () => {
      /** `it.live`: status polling sleeps on the real clock. */
      it.live('success', () =>
        Effect.gen(function* () {
          expect.assertions(3)

          vi.mocked(execFileAsync).mockResolvedValueOnce({
            stdout: 'success',
            stderr: ''
          })
          mockApi.interceptCloudflare(
            MOCK_API_PATH_DEPLOYMENTS,
            RESPONSE_DEPLOYMENTS,
            200
          )
          mockApi.interceptGithub(
            {
              query: QueryGetEnvironment,
              variables: {
                owner: 'andykenward',
                repo: 'github-actions-cloudflare-pages',
                environment_name: 'mock-github-environment',
                qualifiedName: 'mock-github-head-ref'
              }
            },
            {
              data: {
                repository: {
                  environment: {
                    name: 'unlike-dev (Preview)',
                    id: 'EN_kwDOJn0nrM5D_l8n'
                  },
                  ref: {id: REF_ID}
                }
              }
            }
          )

          expect(yield* run).toBeUndefined()
          expect(setOutput).toHaveBeenCalledTimes(5)
          // The pull request was resolved alongside wrangler, then commented on.
          expect(vi.mocked(addComment).mock.calls[0]?.[0]).toBe(
            'mock-pull-request-id'
          )
        }).pipe(Effect.provide(DeployLayer))
      )

      it.live('stops wrangler when the GitHub Environment is missing', () => {
        const {promise: wranglerStarted, resolve: startWrangler} =
          Promise.withResolvers<void>()

        let signal: AbortSignal | undefined
        vi.mocked(execFileAsync).mockImplementationOnce(((
          _file: string,
          _args: ReadonlyArray<string>,
          options: {signal: AbortSignal}
        ) => {
          signal = options.signal
          startWrangler()
          // A long upload: settles only when aborted.
          return new Promise((_resolve, reject) => {
            options.signal.addEventListener('abort', () =>
              reject(new Error('aborted'))
            )
          })
        }) as never)

        /**
         * Answers the environment check only once wrangler is running, so the
         * failure always has a wrangler to stop. Provided inside `DeployLayer`,
         * so it takes the place of the real client.
         */
        const gitHubApi = Layer.succeed(
          GitHubApi,
          GitHubApi.of({
            request: () =>
              Effect.promise(() => wranglerStarted).pipe(
                Effect.as(ENVIRONMENT_MISSING as never)
              )
          })
        )

        return Effect.gen(function* () {
          expect.assertions(3)

          const error = yield* Effect.flip(run)

          expect(error.message).toBe(
            'GitHub Environment: Not created for mock-github-environment'
          )
          expect(signal?.aborted).toBe(true)
          expect(addComment).not.toHaveBeenCalled()
        }).pipe(Effect.provide(gitHubApi), Effect.provide(DeployLayer))
      })
    })
  })
})
