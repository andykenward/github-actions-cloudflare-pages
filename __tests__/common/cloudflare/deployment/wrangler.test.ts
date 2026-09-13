import {mkdir, mkdtemp, readdir, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

import {debug} from '@actions/core'
import {it} from '@effect/vitest'
import * as Duration from 'effect/Duration'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {
  deploymentIdFrom,
  wranglerPagesDeploy,
  WranglerTimeout
} from '@/common/cloudflare/deployment/wrangler.js'
import {execFileAsync} from '@/common/utils.js'
import {
  MOCK_ACCOUNT_ID,
  MOCK_DEPLOYMENT_ID,
  MOCK_PROJECT_NAME
} from '@/tests/helpers/api.js'
import {wranglerReporting} from '@/tests/helpers/wrangler.js'

vi.mock(import('@/common/utils.js'))
vi.mock(import('@actions/core'))
vi.mock(import('node:fs/promises'), async importOriginal => {
  const original = await importOriginal()
  return {...original, rm: vi.fn(original.rm)}
})

const line = (entry: object): string => `${JSON.stringify(entry)}\n`

describe(deploymentIdFrom, () => {
  test('returns the id from the pages-deploy-detailed entry', () => {
    expect.assertions(1)

    const output =
      line({type: 'wrangler-session', version: 1}) +
      line({
        type: 'pages-deploy-detailed',
        version: 1,
        pages_project: 'project',
        deployment_id: 'deployment-id',
        url: 'https://example.pages.dev'
      })

    expect(deploymentIdFrom(output)).toBe('deployment-id')
  })

  test('reads Windows line endings', () => {
    expect.assertions(1)

    const output =
      line({type: 'wrangler-session', version: 1}).replace('\n', '\r\n') +
      line({type: 'pages-deploy-detailed', version: 1, deployment_id: 'id'})

    expect(deploymentIdFrom(output)).toBe('id')
  })

  test('returns undefined when wrangler wrote no such entry', () => {
    expect.assertions(2)

    expect(deploymentIdFrom('')).toBeUndefined()
    expect(
      deploymentIdFrom(line({type: 'wrangler-session', version: 1}))
    ).toBeUndefined()
  })

  test('skips lines that are not JSON', () => {
    expect.assertions(1)

    const output =
      '{not json\n' +
      line({type: 'pages-deploy-detailed', deployment_id: 'deployment-id'})

    expect(deploymentIdFrom(output)).toBe('deployment-id')
  })
})

const DEPLOY_ARGS = {
  wranglerVersion: '4.0.0',
  apiToken: Redacted.make('mock-cloudflare-api-token'),
  accountId: MOCK_ACCOUNT_ID,
  projectName: MOCK_PROJECT_NAME,
  directory: 'mock-directory',
  branch: 'mock-branch',
  commitHash: 'mock-sha',
  workingDirectory: ''
}

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('wranglerPagesDeploy', () => {
  /** Stands in for the runner's `RUNNER_TEMP`. */
  let runnerTemp: string

  beforeEach(async () => {
    runnerTemp = await mkdtemp(path.join(tmpdir(), 'runner-temp-'))
  })

  afterEach(async () => {
    vi.mocked(execFileAsync).mockReset()
    await rm(runnerTemp, {recursive: true, force: true})
  })

  it.effect(
    'points wrangler at an output file under RUNNER_TEMP, then removes it',
    () => {
      vi.stubEnv('RUNNER_TEMP', runnerTemp)

      return Effect.gen(function* () {
        expect.assertions(3)

        let outputFile = ''
        vi.mocked(execFileAsync).mockImplementationOnce(
          wranglerReporting(MOCK_DEPLOYMENT_ID, file => {
            outputFile = file
          }) as never
        )

        const result = yield* wranglerPagesDeploy(DEPLOY_ARGS)

        expect(result).toStrictEqual({
          stdout: 'success',
          deploymentId: MOCK_DEPLOYMENT_ID
        })
        expect(path.relative(runnerTemp, outputFile)).toMatch(
          /^wrangler-output-[^/]+\/output\.jsonl$/
        )
        expect(yield* Effect.promise(() => readdir(runnerTemp))).toStrictEqual(
          []
        )
      })
    }
  )

  it.effect('fails when the output file cannot be read', () => {
    vi.stubEnv('RUNNER_TEMP', runnerTemp)

    return Effect.gen(function* () {
      expect.assertions(1)

      // A directory where the file should be: `EISDIR` on read, not `ENOENT`.
      vi.mocked(execFileAsync).mockImplementationOnce((async (
        _file: string,
        _args: ReadonlyArray<string>,
        {env}: {env: NodeJS.ProcessEnv}
      ) => {
        await mkdir(env['WRANGLER_OUTPUT_FILE_PATH'] ?? '')
        return {stdout: 'success', stderr: ''}
      }) as never)

      const error = yield* Effect.flip(wranglerPagesDeploy(DEPLOY_ARGS))

      expect(error).toMatchObject({
        _tag: 'WranglerError',
        // oxlint-disable-next-line typescript/no-unsafe-assignment
        message: expect.stringContaining('EISDIR')
      })
    })
  })

  it.effect(
    'logs, but succeeds, when the output directory cannot be removed',
    () => {
      vi.stubEnv('RUNNER_TEMP', runnerTemp)

      return Effect.gen(function* () {
        expect.assertions(2)

        vi.mocked(execFileAsync).mockImplementationOnce(
          wranglerReporting(MOCK_DEPLOYMENT_ID, () => {}) as never
        )
        vi.mocked(rm).mockRejectedValueOnce(new Error('EBUSY: resource busy'))

        const result = yield* wranglerPagesDeploy(DEPLOY_ARGS)

        expect(result.deploymentId).toBe(MOCK_DEPLOYMENT_ID)
        expect(debug).toHaveBeenCalledWith(
          // oxlint-disable-next-line typescript/no-unsafe-argument
          expect.stringMatching(
            /^Wrangler: could not remove .*: EBUSY: resource busy$/
          )
        )
      })
    }
  )

  it.live('stops wrangler once WranglerTimeout has passed', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      let signal: AbortSignal | undefined
      vi.mocked(execFileAsync).mockImplementationOnce(((
        _file: string,
        _args: ReadonlyArray<string>,
        options: {signal: AbortSignal}
      ) => {
        signal = options.signal
        // A stuck upload: settles only when aborted.
        return new Promise((_resolve, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new Error('aborted'))
          )
        })
      }) as never)

      const error = yield* Effect.flip(wranglerPagesDeploy(DEPLOY_ARGS))

      expect(error).toMatchObject({
        _tag: 'WranglerError',
        message: 'Wrangler: timed out after 50ms'
      })
      expect(signal?.aborted).toBe(true)
    }).pipe(Effect.provide(Layer.succeed(WranglerTimeout, Duration.millis(50))))
  )

  it.effect.each([
    {
      // What `execFile` rejects with: an `Error` whose message prepends the
      // command line, plus the process's stderr.
      title: 'prefers stderr to the command-line message',
      rejection: Object.assign(new Error('Command failed: npx wrangler …'), {
        stderr: '✘ [ERROR] A request to the Cloudflare API failed.'
      }),
      message: '✘ [ERROR] A request to the Cloudflare API failed.'
    },
    {
      // A spawn failure (e.g. `npx` missing) carries an empty stderr.
      title: 'falls back to the Error message when stderr is empty',
      rejection: Object.assign(new Error('spawn npx ENOENT'), {stderr: ''}),
      message: 'spawn npx ENOENT'
    },
    {
      title: 'names an unrecognised rejection',
      rejection: 42,
      message: 'Wrangler: unknown error'
    }
  ])('$title', ({rejection, message}) => {
    vi.stubEnv('RUNNER_TEMP', runnerTemp)

    return Effect.gen(function* () {
      expect.assertions(1)

      vi.mocked(execFileAsync).mockRejectedValueOnce(rejection)

      const error = yield* Effect.flip(wranglerPagesDeploy(DEPLOY_ARGS))

      expect(error).toMatchObject({_tag: 'WranglerError', message})
    })
  })

  it.effect(
    'fails without running wrangler when the output directory cannot be created',
    () => {
      vi.stubEnv('RUNNER_TEMP', path.join(runnerTemp, 'missing'))

      return Effect.gen(function* () {
        expect.assertions(2)

        const error = yield* Effect.flip(wranglerPagesDeploy(DEPLOY_ARGS))

        expect(error).toMatchObject({
          _tag: 'WranglerError',
          // oxlint-disable-next-line typescript/no-unsafe-assignment
          message: expect.stringContaining('ENOENT')
        })
        expect(execFileAsync).not.toHaveBeenCalled()
      })
    }
  )
})
