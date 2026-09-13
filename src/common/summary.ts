import {summary} from '@actions/core'
import * as Effect from 'effect/Effect'

export type Summary = typeof summary

/**
 * Adds to the job summary with `build` and writes it. `mapError` turns a
 * failed write into the caller's error.
 */
export const writeSummary = Effect.fn('writeSummary')(function* <E>(
  build: (summary: Summary) => Summary,
  mapError: (cause: unknown) => E
) {
  yield* Effect.tryPromise({
    try: async () => {
      await build(summary).write()
    },
    catch: mapError
  })
})
