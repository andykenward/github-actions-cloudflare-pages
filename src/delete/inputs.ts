import type * as Effect from 'effect/Effect'

import * as Config from 'effect/Config'
import * as Context from 'effect/Context'
import * as Layer from 'effect/Layer'

import {readInputs} from '@/common/config/provider.js'
import {INPUT_KEYS_KEEP_LATEST} from '@/input-keys'

/**
 * The provider treats absent and empty-string inputs alike, so the default
 * covers both — matching the previous `Number(getInput(...) || '')` behaviour,
 * which yielded `0` when the input was not supplied.
 */
const deleteConfig = Config.all({
  /** How many deployments to keep. */
  keepLatest: Config.int(INPUT_KEYS_KEEP_LATEST).pipe(Config.withDefault(0))
})

/** Inputs only the delete action uses. See `CommonInputs` on memoisation. */
export class DeleteInputs extends Context.Service<
  DeleteInputs,
  Effect.Success<typeof deleteConfig>
>()('github-actions-cloudflare-pages/delete/inputs/DeleteInputs') {
  static readonly layer = Layer.effect(DeleteInputs, readInputs(deleteConfig))
}
