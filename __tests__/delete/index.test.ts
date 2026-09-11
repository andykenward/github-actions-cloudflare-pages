import * as Effect from 'effect/Effect'
import {describe, expect, test, vi} from 'vitest'

import type {StubbedRun} from '@/tests/helpers/entry-point.js'

import {INPUT_KEYS_KEEP_LATEST} from '@/input-keys'
import {runEntryPoint, testRunOutcomes} from '@/tests/helpers/entry-point.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

vi.mock(import('@actions/core'))

/** What the stubbed `run` evaluates to; `DeleteLayer` stays real. */
const runStub = vi.hoisted(() => vi.fn<StubbedRun>())

vi.mock(import('@/delete/main.js'), async importOriginal => ({
  ...(await importOriginal()),
  run: Effect.suspend(runStub) as never
}))

const importEntryPoint = () => import('@/delete/index.js')

describe('delete entry point', () => {
  // Registers the shared tests; it isn't setup code.
  // oxlint-disable-next-line vitest/require-hook
  testRunOutcomes(runStub, importEntryPoint)

  test('fails the step naming an invalid input, before run starts', async () => {
    expect.assertions(2)

    stubInputEnv(INPUT_KEYS_KEEP_LATEST, 'abc')

    const {setFailed} = await runEntryPoint(importEntryPoint)

    expect(setFailed).toHaveBeenCalledExactlyOnceWith(
      "Input 'keep-latest' is invalid: Expected a string representing a finite number"
    )
    expect(runStub).not.toHaveBeenCalled()
  })
})
