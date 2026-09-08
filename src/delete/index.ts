import {setFailed} from '@actions/core'
import * as Cause from 'effect/Cause'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'

import {run} from './main.js'

/** See the note in `src/deploy/index.ts`. */
const exit = await Effect.runPromiseExit(run)

if (Exit.isFailure(exit) && !Cause.hasInterruptsOnly(exit.cause)) {
  setFailed(Cause.pretty(exit.cause))
}
