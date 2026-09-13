import type * as Effect from 'effect/Effect'

import * as Config from 'effect/Config'
import * as Context from 'effect/Context'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import {optionalInput, readInputs} from '@/common/config/provider.js'
import {INPUT_KEY_GITHUB_ENVIRONMENT, INPUT_KEY_KEEP_LATEST} from '@/input-keys'

const deleteConfig = Config.all({
  /**
   * How many of the newest deployments to keep. Absent and empty both mean
   * `0`; a negative number is rejected rather than sliced from the end.
   */
  keepLatest: Config.schema(Schema.Natural, INPUT_KEY_KEEP_LATEST).pipe(
    Config.withDefault(0)
  ),
  /** GitHub Environment to limit the deletion to; `undefined` means all. */
  gitHubEnvironment: optionalInput(INPUT_KEY_GITHUB_ENVIRONMENT)
})

/** Inputs only the delete action uses. See `CommonInputs` on memoisation. */
export class DeleteInputs extends Context.Service<
  DeleteInputs,
  Effect.Success<typeof deleteConfig>
>()('github-actions-cloudflare-pages/delete/inputs/DeleteInputs') {
  static readonly layer = Layer.effect(DeleteInputs, readInputs(deleteConfig))
}
