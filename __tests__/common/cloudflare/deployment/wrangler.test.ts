import {mkdtemp, readdir, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Redacted from 'effect/Redacted'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import {
  deploymentIdFrom,
  wranglerPagesDeploy
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
