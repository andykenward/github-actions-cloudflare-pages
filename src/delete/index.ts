import * as Cause from 'effect/Cause'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'

import {reportFailure} from '@/common/errors.js'

import {DeleteLayer, run} from './main.js'

/** See the note in `src/deploy/index.ts`. */
const exit = await Effect.runPromiseExit(
  // oxlint-disable-next-line effecttsgo/strict-effect-provide
  run.pipe(Effect.provide(DeleteLayer))
)

if (Exit.isFailure(exit) && !Cause.hasInterruptsOnly(exit.cause)) {
  reportFailure(exit.cause)
}
