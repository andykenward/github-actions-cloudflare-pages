import * as Effect from 'effect/Effect'
import {describe, expect, test, vi} from 'vitest'

import type {StubbedRun} from '@/tests/helpers/entry-point.js'

import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_WORKING_DIRECTORY
} from '@/input-keys'
import {runEntryPoint, testRunOutcomes} from '@/tests/helpers/entry-point.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

vi.mock(import('@actions/core'))

/** What the stubbed `run` evaluates to; `DeployLayer` stays real. */
const runStub = vi.hoisted(() => vi.fn<StubbedRun>())

vi.mock(import('@/deploy/main.js'), async importOriginal => ({
  ...(await importOriginal()),
  run: Effect.suspend(runStub) as never
}))

const importEntryPoint = () => import('@/deploy/index.js')

describe('deploy entry point', () => {
  // Registers the shared tests; it isn't setup code.
  // oxlint-disable-next-line vitest/require-hook
  testRunOutcomes(runStub, importEntryPoint)

  test('fails the step naming a missing input, before run starts', async () => {
    expect.assertions(2)

    stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN, '')

    const {setFailed} = await runEntryPoint(importEntryPoint)

    expect(setFailed).toHaveBeenCalledExactlyOnceWith(
      'Input required and not supplied: cloudflare-api-token'
    )
    expect(runStub).not.toHaveBeenCalled()
  })

  test('fails the step when the working directory does not exist', async () => {
    expect.assertions(2)

    stubInputEnv(INPUT_KEY_WORKING_DIRECTORY, 'does-not-exist')

    const {setFailed} = await runEntryPoint(importEntryPoint)

    expect(setFailed).toHaveBeenCalledExactlyOnceWith(
      "Input 'working-directory' is invalid: Directory not found: does-not-exist"
    )
    expect(runStub).not.toHaveBeenCalled()
  })

  test('interrupts run on SIGINT, so it can record the cancellation', async () => {
    expect.assertions(2)

    let interrupted = false
    runStub.mockReturnValue(
      Effect.never.pipe(
        Effect.onInterrupt(() =>
          Effect.sync(() => {
            interrupted = true
          })
        )
      )
    )

    const done = runEntryPoint(importEntryPoint)
    // The listener is registered before `run` starts; never signal without it.
    await vi.waitFor(() => {
      if (runStub.mock.calls.length === 0) {
        throw new Error('run has not started')
      }
    })
    process.emit('SIGINT')
    const {setFailed} = await done

    expect(interrupted).toBe(true)
    expect(setFailed).not.toHaveBeenCalled()
  })
})
