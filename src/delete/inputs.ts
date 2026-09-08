import * as Config from 'effect/Config'
import * as Effect from 'effect/Effect'

import {actionInputProvider} from '@/common/config/provider.js'
import {INPUT_KEYS_KEEP_LATEST} from '@/input-keys'

/**
 * The provider treats absent and empty-string inputs alike, so the default
 * covers both — matching the previous `Number(getInput(...) || '')` behaviour,
 * which yielded `0` when the input was not supplied.
 */
const inputsConfig = Config.all({
  /** How many deployments to keep. */
  keepLatest: Config.int(INPUT_KEYS_KEEP_LATEST).pipe(Config.withDefault(0))
})

type UseInputs = Effect.Success<typeof inputsConfig>

let _inputs: UseInputs

/** Memoises success only — see the note in `src/deploy/inputs.ts`. */
export const useInputs = (): UseInputs =>
  _inputs ?? (_inputs = Effect.runSync(inputsConfig.parse(actionInputProvider)))
