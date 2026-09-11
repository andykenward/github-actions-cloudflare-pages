import {existsSync} from 'node:fs'
import path from 'node:path'

import {info, setOutput, summary} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, vi} from 'vitest'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {MockApi} from '@/tests/helpers/api.js'
import type {ExecFileOptions} from '@/tests/helpers/wrangler.js'

import {createCloudflareDeployment} from '@/common/cloudflare/deployment/create.js'
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  WRANGLER_OUTPUT_FILE_PATH
} from '@/common/cloudflare/deployment/wrangler.js'
import {CommonLayer} from '@/common/layer.js'
import {execFileAsync} from '@/common/utils.js'
import {INPUT_KEY_WORKING_DIRECTORY} from '@/input-keys'
import RESPONSE_NOT_FOUND_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments-not-found.response.json' with {type: 'json'}
import RESPONSE_DEPLOYMENTS_IDLE from '@/responses/api.cloudflare.com/pages/deployments/deployments.idle.response.json' with {type: 'json'}
import RESPONSE_DEPLOYMENTS from '@/responses/api.cloudflare.com/pages/deployments/deployments.response.json' with {type: 'json'}
import {
  MOCK_API_PATH_DEPLOYMENT,
  MOCK_API_PATH_DEPLOYMENTS,
  MOCK_DEPLOYMENT_ID,
  setMockApi
} from '@/tests/helpers/api.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'
import {wranglerReporting} from '@/tests/helpers/wrangler.js'

import packageJson from '../../../../package.json' with {type: 'json'}

vi.mock(import('@/common/utils.js'))
vi.mock(import('@actions/core'))

/**
 * `it.live`: status polling sleeps on the real clock between polls.
 * `Effect.fn` returns an anonymous function, so the title is a string.
 */
// oxlint-disable-next-line vitest/prefer-describe-function-title
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
      vi.mocked(execFileAsync).mockReset()
      vi.runOnlyPendingTimers()
      vi.useRealTimers()
    })

    it.live('handles thrown error from wrangler deploy', () =>
      Effect.gen(function* () {
        expect.assertions(10)

        vi.mocked(execFileAsync).mockRejectedValueOnce({
          stderr: 'Oh no!',
          stdout: ''
        })

        // Expect Cloudflare Api Token and Account Id to be undefined.
        expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
        expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

        const error = yield* Effect.flip(
          createCloudflareDeployment({
            accountId: 'mock-cloudflare-account-id',
            projectName: 'mock-cloudflare-project-name',
            directory: 'mock-directory'
          })
        )

        expect(error).toMatchObject({
          _tag: 'WranglerError',
          message: 'Oh no!'
        })

        expect(execFileAsync).toHaveBeenCalledWith(
          'npx',
          [
            `wrangler@${packageJson.devDependencies.wrangler}`,
            'pages',
            'deploy',
            'mock-directory',
            '--project-name',
            'mock-cloudflare-project-name',
            '--branch',
            'mock-github-head-ref',
            '--commit-dirty=true',
            '--commit-hash',
            'mock-github-sha'
          ],
          {
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            env: expect.objectContaining({
              CLOUDFLARE_ACCOUNT_ID: 'mock-cloudflare-account-id',
              CLOUDFLARE_API_TOKEN: 'mock-cloudflare-api-token'
            }),
            cwd: '',
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            signal: expect.any(AbortSignal)
          }
        )

        expect(execFileAsync).toHaveBeenCalledTimes(1)
        expect(info).not.toHaveBeenCalled()
        // The credentials go to the wrangler child process only; this process's
        // environment must stay clean.
        expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
        expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

        expect(setOutput).not.toHaveBeenCalled()
        expect(summary.addTable).not.toHaveBeenCalled()
      }).pipe(Effect.provide(CommonLayer))
    )

    it.effect('fails without running wrangler when there is no branch', () => {
      // Neither the `branch` argument nor the context gives one. `undefined`
      // removes the variable; an empty string would still count as a branch.
      // oxlint-disable-next-line unicorn/no-useless-undefined
      vi.stubEnv('GITHUB_HEAD_REF', undefined)
      // oxlint-disable-next-line unicorn/no-useless-undefined
      vi.stubEnv('GITHUB_REF_NAME', undefined)

      return Effect.gen(function* () {
        expect.assertions(2)

        const error = yield* Effect.flip(
          createCloudflareDeployment({
            accountId: 'mock-cloudflare-account-id',
            projectName: 'mock-cloudflare-project-name',
            directory: 'mock-directory'
          })
        )

        expect(error).toMatchObject({
          _tag: 'CreateDeploymentError',
          message: 'Create Deployment: branch is undefined'
        })
        expect(execFileAsync).not.toHaveBeenCalled()
      }).pipe(Effect.provide(CommonLayer))
    })

    it.live('handles thrown error from getDeployments', () =>
      Effect.gen(function* () {
        expect.assertions(5)

        vi.mocked(execFileAsync).mockResolvedValueOnce({
          stdout: 'success',
          stderr: ''
        })

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          RESPONSE_NOT_FOUND_DEPLOYMENTS,
          404
        )

        const error = yield* Effect.flip(
          createCloudflareDeployment({
            accountId: 'mock-cloudflare-account-id',
            projectName: 'mock-cloudflare-project-name',
            directory: 'mock-directory'
          })
        )

        expect(error).toMatchObject({
          _tag: 'CloudflareApiError',
          message: `A request to the Cloudflare API (https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/deployments) failed. Project not found. The specified project name does not match any of your existing projects. [code: 8000007]`
        })
        expect(execFileAsync).toHaveBeenCalledTimes(1)
        expect(info).toHaveBeenCalledWith('success')
        expect(setOutput).not.toHaveBeenCalled()
        expect(summary.addTable).not.toHaveBeenCalled()
      }).pipe(Effect.provide(CommonLayer))
    )

    it.live('handles success', () => {
      stubInputEnv(INPUT_KEY_WORKING_DIRECTORY)

      return Effect.gen(function* () {
        expect.assertions(15)

        vi.mocked(execFileAsync).mockResolvedValueOnce({
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

        const {deployment, wranglerOutput} = yield* createCloudflareDeployment({
          accountId: 'mock-cloudflare-account-id',
          projectName: 'mock-cloudflare-project-name',
          directory: 'mock-directory',
          workingDirectory: 'mock-working-directory',
          statusOptions: {pollInterval: 0}
        })

        expect(execFileAsync).toHaveBeenCalledWith(
          'npx',
          [
            `wrangler@${packageJson.devDependencies.wrangler}`,
            'pages',
            'deploy',
            'mock-directory',
            '--project-name',
            'mock-cloudflare-project-name',
            '--branch',
            'mock-github-head-ref',
            '--commit-dirty=true',
            '--commit-hash',
            'mock-github-sha'
          ],
          {
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            env: expect.objectContaining({
              CLOUDFLARE_ACCOUNT_ID: 'mock-cloudflare-account-id',
              CLOUDFLARE_API_TOKEN: 'mock-cloudflare-api-token'
            }),
            cwd: 'mock-working-directory',
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            signal: expect.any(AbortSignal)
          }
        )

        expect(wranglerOutput).toMatchInlineSnapshot(`"success"`)
        expect(deployment).toMatchSnapshot()
        expect(deployment.id).toMatchInlineSnapshot(
          '"206e215c-33b3-4ce4-adf4-7fc6c9b65483"'
        )
        expect(info).toHaveBeenCalledWith('success')

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
      }).pipe(Effect.provide(CommonLayer))
    })

    it.live('handles branch override', () =>
      Effect.gen(function* () {
        expect.assertions(4)

        vi.mocked(execFileAsync).mockResolvedValueOnce({
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

        yield* createCloudflareDeployment({
          accountId: 'mock-cloudflare-account-id',
          projectName: 'mock-cloudflare-project-name',
          directory: 'mock-directory',
          branch: 'pr-123',
          statusOptions: {pollInterval: 0}
        })

        expect(execFileAsync).toHaveBeenCalledWith(
          'npx',
          [
            `wrangler@${packageJson.devDependencies.wrangler}`,
            'pages',
            'deploy',
            'mock-directory',
            '--project-name',
            'mock-cloudflare-project-name',
            '--branch',
            'pr-123',
            '--commit-dirty=true',
            '--commit-hash',
            'mock-github-sha'
          ],
          {
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            env: expect.objectContaining({
              CLOUDFLARE_ACCOUNT_ID: 'mock-cloudflare-account-id',
              CLOUDFLARE_API_TOKEN: 'mock-cloudflare-api-token'
            }),
            cwd: '',
            // oxlint-disable-next-line typescript/no-unsafe-assignment
            signal: expect.any(AbortSignal)
          }
        )

        expect(execFileAsync).toHaveBeenCalledTimes(1)
        expect(info).toHaveBeenCalledWith('success')
        expect(summary.addTable).toHaveBeenCalledTimes(1)
      }).pipe(Effect.provide(CommonLayer))
    )

    it.live('escapes pull request controlled values in the summary', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        vi.mocked(execFileAsync).mockResolvedValueOnce({
          stdout: '<b>wrangler</b>',
          stderr: ''
        })

        const [first, ...rest] = RESPONSE_DEPLOYMENTS.result

        mockApi
          .interceptCloudflare(
            MOCK_API_PATH_DEPLOYMENTS,
            RESPONSE_DEPLOYMENTS_IDLE,
            200
          )
          .times(2)

        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENTS,
          {
            ...RESPONSE_DEPLOYMENTS,
            result: [
              {
                ...first,
                deployment_trigger: {
                  ...first?.deployment_trigger,
                  metadata: {
                    ...first?.deployment_trigger.metadata,
                    branch: `x'><script>alert(1)</script>`,
                    commit_message: '<img src=x onerror=alert(1)>'
                  }
                }
              },
              ...rest
            ]
          },
          200
        )

        yield* createCloudflareDeployment({
          accountId: 'mock-cloudflare-account-id',
          projectName: 'mock-cloudflare-project-name',
          directory: 'mock-directory',
          statusOptions: {pollInterval: 0}
        })

        expect(vi.mocked(summary.addTable).mock.calls[0]?.[0])
          .toMatchInlineSnapshot(`
            [
              [
                {
                  "data": "Name",
                  "header": true,
                },
                {
                  "data": "Result",
                  "header": true,
                },
              ],
              [
                "Environment:",
                "production",
              ],
              [
                "Branch:",
                "<a href='https://github.com/andykenward/github-actions-cloudflare-pages/tree/x&#39;%3E%3Cscript%3Ealert(1)%3C/script%3E'><code>x&#39;&gt;&lt;script&gt;alert(1)&lt;/script&gt;</code></a>",
              ],
              [
                "Commit Hash:",
                "<a href='https://github.com/andykenward/github-actions-cloudflare-pages/commit/mock-github-sha'><code>mock-github-sha</code></a>",
              ],
              [
                "Commit Message:",
                "&lt;img src=x onerror=alert(1)&gt;",
              ],
              [
                "Status:",
                "<strong>SUCCESS</strong>",
              ],
              [
                "Preview URL:",
                "<a href='https://206e215c.cloudflare-pages-action-a5z.pages.dev'>https://206e215c.cloudflare-pages-action-a5z.pages.dev</a>",
              ],
              [
                "Branch Preview URL:",
                "<a href='https://unknown-branch.cloudflare-pages-action-a5z.pages.dev'>https://unknown-branch.cloudflare-pages-action-a5z.pages.dev</a>",
              ],
              [
                "Wrangler Output:",
                "&lt;b&gt;wrangler&lt;/b&gt;",
              ],
            ]
          `)
      }).pipe(Effect.provide(CommonLayer))
    )
  })
})

type LatestStage = PagesDeployment['latest_stage']

/** A single-deployment GET response whose `deploy` stage has `status`. */
const deploymentResponse = (status: LatestStage['status']) => ({
  ...RESPONSE_DEPLOYMENTS,
  result: {
    ...RESPONSE_DEPLOYMENTS.result[0],
    latest_stage: {name: 'deploy', status, started_on: null, ended_on: null}
  }
})

describe('createCloudflareDeployment with the deployment id wrangler reports', () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
    vi.mocked(execFileAsync).mockReset()
  })

  it.live(
    'polls that deployment, not the list, and removes the output file',
    () =>
      Effect.gen(function* () {
        expect.assertions(3)

        let outputFile = ''
        vi.mocked(execFileAsync).mockImplementationOnce(
          wranglerReporting(MOCK_DEPLOYMENT_ID, file => {
            outputFile = file
          }) as never
        )

        // No list interceptor: a list request would fail, as net connect is off.
        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          deploymentResponse('idle')
        )
        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          deploymentResponse('success')
        )

        const {deployment} = yield* createCloudflareDeployment({
          accountId: 'mock-cloudflare-account-id',
          projectName: 'mock-cloudflare-project-name',
          directory: 'mock-directory',
          statusOptions: {pollInterval: 0}
        })

        expect(deployment.id).toBe(RESPONSE_DEPLOYMENTS.result[0]?.id)
        expect(outputFile).toMatch(/wrangler-output-/)
        expect(existsSync(path.dirname(outputFile))).toBe(false)
      }).pipe(Effect.provide(CommonLayer))
  )

  it.live('removes the output file when wrangler fails', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      let outputFile = ''
      vi.mocked(execFileAsync).mockImplementationOnce(((
        _file: string,
        _args: ReadonlyArray<string>,
        {env}: ExecFileOptions
      ) => {
        outputFile = env[WRANGLER_OUTPUT_FILE_PATH] ?? ''
        return Promise.reject(new Error('Command failed'))
      }) as never)

      const error = yield* Effect.flip(
        createCloudflareDeployment({
          accountId: 'mock-cloudflare-account-id',
          projectName: 'mock-cloudflare-project-name',
          directory: 'mock-directory'
        })
      )

      expect(error).toMatchObject({
        _tag: 'WranglerError',
        message: 'Command failed'
      })
      expect(existsSync(path.dirname(outputFile))).toBe(false)
    }).pipe(Effect.provide(CommonLayer))
  )

  it.live(
    'fails after setting the outputs when the summary is not written',
    () =>
      Effect.gen(function* () {
        expect.assertions(2)

        const message =
          'Unable to find environment variable for $GITHUB_STEP_SUMMARY. Check if your runtime environment supports job summaries.'
        vi.mocked(summary.write).mockRejectedValueOnce(new Error(message))
        vi.mocked(execFileAsync).mockImplementationOnce(
          wranglerReporting(MOCK_DEPLOYMENT_ID, () => {}) as never
        )
        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          deploymentResponse('success')
        )

        const error = yield* Effect.flip(
          createCloudflareDeployment({
            accountId: 'mock-cloudflare-account-id',
            projectName: 'mock-cloudflare-project-name',
            directory: 'mock-directory',
            statusOptions: {pollInterval: 0}
          })
        )

        expect(error).toMatchObject({_tag: 'CreateDeploymentError', message})
        expect(setOutput).toHaveBeenCalledWith(
          'id',
          RESPONSE_DEPLOYMENTS.result[0]?.id
        )
      }).pipe(Effect.provide(CommonLayer))
  )

  it.live.each([
    {status: 'failure', outcome: 'failed'},
    {status: 'canceled', outcome: 'was canceled'}
  ] as const)(
    'fails after writing the outputs and summary when the build is $status',
    ({status, outcome}) =>
      Effect.gen(function* () {
        expect.assertions(4)

        vi.mocked(execFileAsync).mockImplementationOnce(
          wranglerReporting(MOCK_DEPLOYMENT_ID, () => {}) as never
        )
        mockApi.interceptCloudflare(
          MOCK_API_PATH_DEPLOYMENT,
          deploymentResponse(status)
        )

        const error = yield* Effect.flip(
          createCloudflareDeployment({
            accountId: 'mock-cloudflare-account-id',
            projectName: 'mock-cloudflare-project-name',
            directory: 'mock-directory',
            statusOptions: {pollInterval: 0}
          })
        )

        const id = RESPONSE_DEPLOYMENTS.result[0]?.id
        expect(error).toMatchObject({
          _tag: 'CreateDeploymentError',
          message: `Create Deployment: the Cloudflare Pages build ${outcome}. Build log: https://dash.cloudflare.com/mock-cloudflare-account-id/pages/view/mock-cloudflare-project-name/${id}`
        })
        // The outputs and summary still record the failed deployment.
        expect(setOutput).toHaveBeenCalledWith('id', id)
        expect(summary.addTable).toHaveBeenCalledTimes(1)
        expect(vi.mocked(summary.addTable).mock.calls[0]?.[0]).toContainEqual([
          'Status:',
          `<strong>${status.toUpperCase()}</strong>`
        ])
      }).pipe(Effect.provide(CommonLayer))
  )
})
