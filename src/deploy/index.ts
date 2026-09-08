import {setFailed} from '@actions/core'
import * as Cause from 'effect/Cause'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'

import {run} from './main.js'

/**
 * `runPromiseExit` never rejects, so there is no floating-rejection path: the
 * previous `void run()` left failures unhandled and exited 0 on a failed
 * deploy. `runFork` would reintroduce that, and `runMain` lives in
 * `@effect/platform-node`, whose teardown calls `process.exit` and can truncate
 * the buffered workflow commands this action writes to stdout.
 */
const exit = await Effect.runPromiseExit(run)

if (Exit.isFailure(exit) && !Cause.hasInterruptsOnly(exit.cause)) {
  setFailed(Cause.pretty(exit.cause))
}
