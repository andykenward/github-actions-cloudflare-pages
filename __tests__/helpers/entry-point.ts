import type * as Core from '@actions/core'
import type {Mock} from 'vitest'

import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import {expect, test, vi} from 'vitest'

// oxlint-disable-next-line unicorn/throw-new-error
class RunError extends Schema.TaggedError<RunError>()('RunError', {
  message: Schema.String
}) {}

/**
 * What an entry point's stubbed `run` evaluates to. The stub's outcomes
 * needn't be ones the real `run` can produce.
 */
export type StubbedRun = () => Effect.Effect<void, RunError>

/**
 * The entry point runs on import, so import it afresh. `resetModules` also
 * re-creates the `@actions/core` mock, so return the instance it reported to.
 */
export const runEntryPoint = async (
  importEntryPoint: () => Promise<unknown>
): Promise<typeof Core> => {
  vi.resetModules()
  const core = await import('@actions/core')
  await importEntryPoint()
  return core
}

/** How `run`'s outcome reaches the step — the same for every entry point. */
export const testRunOutcomes = (
  runStub: Mock<StubbedRun>,
  importEntryPoint: () => Promise<unknown>
) => {
  test('does not fail the step when run succeeds', async () => {
    expect.assertions(2)

    runStub.mockReturnValue(Effect.void)

    const {setFailed} = await runEntryPoint(importEntryPoint)

    expect(runStub).toHaveBeenCalledTimes(1)
    expect(setFailed).not.toHaveBeenCalled()
  })

  test('fails the step once with the message when run fails', async () => {
    expect.assertions(2)

    runStub.mockReturnValue(Effect.fail(new RunError({message: 'boom'})))

    const {debug, setFailed} = await runEntryPoint(importEntryPoint)

    expect(setFailed).toHaveBeenCalledExactlyOnceWith('boom')
    // The full cause, with its stack, only in the debug log.
    expect(debug).toHaveBeenCalledWith(expect.stringMatching(/boom\n\s+at /))
  })

  test('does not report an interruption as a failure', async () => {
    expect.assertions(1)

    runStub.mockReturnValue(Effect.interrupt)

    const {setFailed} = await runEntryPoint(importEntryPoint)

    expect(setFailed).not.toHaveBeenCalled()
  })
}
