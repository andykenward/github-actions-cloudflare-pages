import {summary} from '@actions/core'
import * as Effect from 'effect/Effect'

export type Summary = typeof summary

/**
 * Adds to the job summary with `build` and writes it. `catchError` maps a
 * failed write into the caller's error.
 */
export const writeSummary = <E>(
  build: (summary: Summary) => Summary,
  catchError: (cause: unknown) => E
): Effect.Effect<void, E> =>
  Effect.tryPromise({
    try: () => build(summary).write(),
    catch: catchError
  }).pipe(Effect.asVoid)
