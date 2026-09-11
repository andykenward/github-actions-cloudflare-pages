import * as Cause from 'effect/Cause'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'

import {reportFailure} from '@/common/errors.js'

import {DeployLayer, run} from './main.js'

/**
 * `runPromiseExit` never rejects, so there is no floating-rejection path: the
 * previous `void run()` left failures unhandled and exited 0 on a failed
 * deploy. `runFork` would reintroduce that, and `runMain` lives in
 * `@effect/platform-node`, whose teardown calls `process.exit` and can truncate
 * the buffered workflow commands this action writes to stdout.
 *
 * A missing or invalid input fails while `DeployLayer` is built, before `run`
 * starts, and is reported the same way.
 */
const exit = await Effect.runPromiseExit(
  // oxlint-disable-next-line effecttsgo/strict-effect-provide
  run.pipe(Effect.provide(DeployLayer))
)

if (Exit.isFailure(exit) && !Cause.hasInterruptsOnly(exit.cause)) {
  reportFailure(exit.cause)
}
