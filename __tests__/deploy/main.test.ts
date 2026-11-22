import {setOutput, warning} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Fiber from 'effect/Fiber'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {GetEnvironmentAndRefQuery} from '@/gql/graphql.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {GitHubApiError} from '@/common/github/api/client.js'
import {updateComment, upsertComment} from '@/common/github/comment.js'
import {
  createGitHubDeployment,
  setGitHubDeploymentStatus
} from '@/common/github/deployment/create.js'
import {execFileAsync} from '@/common/utils.js'
import {DeployLayer, run} from '@/deploy/main.js'
import {
  DeploymentStatusState,
  GetEnvironmentAndRefDocument,
  GetRecentDeploymentsDocument
} from '@/gql/graphql.js'
import {INPUT_KEY_WRANGLER_COMMENT_OUTPUT} from '@/input-keys'
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {
  MOCK_API_PATH_DEPLOYMENT,
  MOCK_API_PATH_DEPLOYMENTS,
  MOCK_DEPLOYMENT_ID,
  setMockApi
} from '@/tests/helpers/api.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'
import {NoPollDelay} from '@/tests/helpers/layers.js'
import {wranglerReporting} from '@/tests/helpers/wrangler.js'

vi.mock(import('@actions/core'))
vi.mock(import('@/common/utils.js'))
vi.mock(import('@/common/github/deployment/create.js'))
vi.mock(import('@/common/github/comment.js'))

const REF_ID = 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='

const ENVIRONMENT = {name: 'unlike-dev (Preview)', id: 'EN_kwDOJn0nrM5D_l8n'}

/** What GitHub returns for an environment that doesn't exist. */
const ENVIRONMENT_MISSING: {
  data: GetEnvironmentAndRefQuery
  errors: {type: string; path: string[]; message: string}[]
} = {
  data: {repository: {environment: null, ref: {id: REF_ID}}},
  errors: [
    {
      type: 'NOT_FOUND',
      path: ['repository', 'environment'],
      message:
        'Could not resolve to an Environment with the name mock-github-environment.'
    }
  ]
}

/** The run log link, from the `GITHUB_RUN_ID` the test env pins. */
const RUN_URL =
  'https://github.com/andykenward/github-actions-cloudflare-pages/actions/runs/1234567890'

const CLOUDFLARE_LOG_URL = `https://dash.cloudflare.com/mock-cloudflare-account-id/pages/view/mock-cloudflare-project-name/${MOCK_DEPLOYMENT_ID}`

/** The deployment, as Cloudflare reports it at `status`. */
const deploymentResponse = (status: string) => ({
  ...RESPONSE_DEPLOYMENTS,
  result: {
    ...RESPONSE_DEPLOYMENTS.result[0],
    latest_stage: {name: 'deploy', status, started_on: null, ended_on: null}
  }
})

/** The body of the last comment update. */
const lastCommentBody = (): string =>
  vi.mocked(updateComment).mock.lastCall?.[1] ?? ''

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

    /** The branch's recent deployments: none, so a new comment is posted. */
    const interceptRecent = (statusCode?: number) =>
      mockApi.interceptGithub(
        {
          query: GetRecentDeploymentsDocument,
          variables: {
            owner: 'andykenward',
            repo: 'github-actions-cloudflare-pages',
            environment: ENVIRONMENT.name
          }
        },
        {data: {repository: {deployments: {nodes: []}}}},
        statusCode
      )

    const interceptEnvironment = (response: object) =>
      mockApi.interceptGithub(
        {
          query: GetEnvironmentAndRefDocument,
          variables: {
            owner: 'andykenward',
            repo: 'github-actions-cloudflare-pages',
            environmentName: 'mock-github-environment',
            qualifiedName: 'mock-github-head-ref'
          }
        },
        response
      )

    /** GitHub has the environment; the run reads the recent deployments. */
    const mockPrepare = () => {
      interceptEnvironment({
        data: {repository: {environment: ENVIRONMENT, ref: {id: REF_ID}}}
      })
      interceptRecent()
    }

    /** Wrangler succeeds, and Cloudflare lists the deployment by commit. */
    const mockSuccessfulDeploy = () => {
      mockPrepare()
      vi.mocked(execFileAsync).mockResolvedValueOnce({
        stdout: 'success',
        stderr: ''
      })
      mockApi.interceptCloudflare(
        MOCK_API_PATH_DEPLOYMENTS,
        RESPONSE_DEPLOYMENTS
      )
      // The newest-run check before the comment is updated.
      interceptRecent()
    }

    describe('run effect', () => {
      /** `it.live`: status polling sleeps on the real clock. */
      it.live('records the deployment in progress, then successful', () =>
        Effect.gen(function* () {
          expect.assertions(6)

          mockSuccessfulDeploy()

          yield* run

          expect(setOutput).toHaveBeenCalledTimes(5)
          // The in-progress comment, posted before wrangler ran.
          expect(vi.mocked(upsertComment).mock.calls[0]?.[0]).toBe(
            'mock-pull-request-id'
          )
          expect(vi.mocked(upsertComment).mock.calls[0]?.[2]).toContain(
            '| Status | 🔄 Building |'
          )
          expect(createGitHubDeployment).toHaveBeenCalledExactlyOnceWith({
            cloudflare: {
              accountId: 'mock-cloudflare-account-id',
              projectName: 'mock-cloudflare-project-name'
            },
            commentId: 'mock-comment-id',
            environment: {...ENVIRONMENT, refId: REF_ID}
          })
          expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
            deploymentId: 'mock-github-deployment-id',
            environment: ENVIRONMENT.name,
            state: DeploymentStatusState.Success,
            environmentUrl:
              'https://206e215c.cloudflare-pages-action-a5z.pages.dev',
            logUrl: CLOUDFLARE_LOG_URL,
            description: `Cloudflare Pages Deployment: ${MOCK_DEPLOYMENT_ID}`
          })
          // Edited in place, with wrangler's output by default.
          expect(lastCommentBody()).toMatch(
            /\| Status \| ✅ Ready \|[\s\S]*### Wrangler Output\n```\nsuccess/
          )
        }).pipe(Effect.provide(DeployLayer))
      )

      it.live(
        'comments without the wrangler output when wrangler-comment-output is false',
        () => {
          // Read when `DeployLayer` is built, so stub before providing it.
          stubInputEnv(INPUT_KEY_WRANGLER_COMMENT_OUTPUT, 'false')

          return Effect.gen(function* () {
            expect.assertions(2)

            mockSuccessfulDeploy()

            yield* run

            expect(lastCommentBody()).toContain('✅ Ready')
            expect(lastCommentBody()).not.toContain('Wrangler Output')
          }).pipe(Effect.provide(DeployLayer))
        }
      )

      it.live(
        'records the deployment without a comment when posting it fails',
        () =>
          Effect.gen(function* () {
            expect.assertions(3)

            mockPrepare()
            vi.mocked(execFileAsync).mockResolvedValueOnce({
              stdout: 'success',
              stderr: ''
            })
            mockApi.interceptCloudflare(
              MOCK_API_PATH_DEPLOYMENTS,
              RESPONSE_DEPLOYMENTS
            )
            vi.mocked(upsertComment).mockReturnValueOnce(
              Effect.fail(
                GitHubApiError.from(
                  new Error('GitHub API request failed: 502 Bad Gateway')
                )
              )
            )

            yield* run

            expect(warning).toHaveBeenCalledWith(
              'deploy - Posting the pull request comment failed; recording the deployment without one: GitHub API request failed: 502 Bad Gateway'
            )
            expect(createGitHubDeployment).toHaveBeenCalledExactlyOnceWith(
              // oxlint-disable-next-line typescript/no-unsafe-assignment
              expect.objectContaining({commentId: undefined})
            )
            // No comment to update, so no newest-run check either.
            expect(updateComment).not.toHaveBeenCalled()
          }).pipe(Effect.provide(DeployLayer))
      )

      it.live(
        'fails before wrangler when the GitHub Environment is missing',
        () =>
          Effect.gen(function* () {
            expect.assertions(3)

            interceptEnvironment(ENVIRONMENT_MISSING)

            const error = yield* Effect.flip(run)

            expect(error.message).toBe(
              'GitHub Environment: Not created for mock-github-environment'
            )
            expect(execFileAsync).not.toHaveBeenCalled()
            expect(createGitHubDeployment).not.toHaveBeenCalled()
          }).pipe(Effect.provide(DeployLayer))
      )

      it.live(
        'marks the deployment failed, linking the run log, when wrangler fails',
        () =>
          Effect.gen(function* () {
            expect.assertions(3)

            mockPrepare()
            vi.mocked(execFileAsync).mockRejectedValueOnce(
              new Error('Upload failed')
            )
            interceptRecent()

            const error = yield* Effect.flip(run)

            // The step still fails with wrangler's error.
            expect(error.message).toContain('Upload failed')
            expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
              deploymentId: 'mock-github-deployment-id',
              environment: ENVIRONMENT.name,
              state: DeploymentStatusState.Failure,
              logUrl: RUN_URL
            })
            expect(lastCommentBody()).toContain(`| Status | ❌ Failed |`)
          }).pipe(Effect.provide(DeployLayer))
      )

      it.live(
        'marks the deployment failed, linking the Cloudflare log, when the build fails',
        () =>
          Effect.gen(function* () {
            expect.assertions(3)

            mockPrepare()
            vi.mocked(execFileAsync).mockImplementationOnce(
              wranglerReporting(MOCK_DEPLOYMENT_ID, () => {}) as never
            )
            // Polled once, then read again when the failure is reported.
            mockApi.interceptCloudflare(
              MOCK_API_PATH_DEPLOYMENT,
              deploymentResponse('failure')
            )
            mockApi.interceptCloudflare(
              MOCK_API_PATH_DEPLOYMENT,
              deploymentResponse('failure')
            )
            interceptRecent()

            const error = yield* Effect.flip(run)

            expect(error.message).toContain('the Cloudflare Pages build failed')
            expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
              deploymentId: 'mock-github-deployment-id',
              environment: ENVIRONMENT.name,
              state: DeploymentStatusState.Failure,
              environmentUrl:
                'https://206e215c.cloudflare-pages-action-a5z.pages.dev',
              logUrl: CLOUDFLARE_LOG_URL,
              description: `Cloudflare Pages Deployment: ${MOCK_DEPLOYMENT_ID}`
            })
            expect(lastCommentBody()).toContain(
              `| Build log | [View build log](${CLOUDFLARE_LOG_URL}) |`
            )
          }).pipe(Effect.provide(NoPollDelay), Effect.provide(DeployLayer))
      )

      it.live('marks a cancelled run as an error', () =>
        Effect.gen(function* () {
          expect.assertions(3)

          mockPrepare()
          let signal: AbortSignal | undefined
          vi.mocked(execFileAsync).mockImplementationOnce(((
            _file: string,
            _args: ReadonlyArray<string>,
            options: {signal: AbortSignal}
          ) => {
            signal = options.signal
            // A long upload: settles only when aborted.
            return new Promise((_resolve, reject) => {
              options.signal.addEventListener('abort', () =>
                reject(new Error('aborted'))
              )
            })
          }) as never)
          interceptRecent()

          const fiber = yield* Effect.forkChild(run)
          yield* Effect.promise(() =>
            vi.waitFor(() => {
              if (!signal) {
                throw new Error('wrangler has not started')
              }
            })
          )
          yield* Fiber.interrupt(fiber)

          expect(signal?.aborted).toBe(true)
          expect(setGitHubDeploymentStatus).toHaveBeenCalledExactlyOnceWith({
            deploymentId: 'mock-github-deployment-id',
            environment: ENVIRONMENT.name,
            state: DeploymentStatusState.Error,
            logUrl: RUN_URL
          })
          expect(lastCommentBody()).toContain('⏹ Cancelled or timed out')
        }).pipe(Effect.provide(DeployLayer))
      )

      it.effect(
        'fails for an unsupported event before starting wrangler',
        () => {
          // The context accepts any webhook event (and only reads the payload's
          // repository), so the pull_request payload stands in for a release.
          vi.stubEnv('GITHUB_EVENT_NAME', 'release')

          return Effect.gen(function* () {
            expect.assertions(2)

            const error = yield* Effect.flip(run)

            expect(error.message).toBe(
              "GitHub Action event name 'release' not supported."
            )
            expect(execFileAsync).not.toHaveBeenCalled()
          }).pipe(Effect.provide(DeployLayer))
        }
      )
    })
  })
})
