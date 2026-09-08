import * as Config from 'effect/Config'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import {actionInputProvider} from '@/common/config/provider.js'
import {checkWorkingDirectory} from '@/common/utils.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_WORKING_DIRECTORY,
  INPUT_KEY_BRANCH
} from '@/input-keys'

/**
 * `Schema.Trim` reproduces `getInput`'s default whitespace trimming. Absent and
 * empty-string inputs are both treated as missing by the provider, so
 * `Config.withDefault` covers the optional cases.
 */
const inputsConfig = Config.all({
  /** Cloudflare Account Id */
  cloudflareAccountId: Config.schema(
    Schema.Trim,
    INPUT_KEY_CLOUDFLARE_ACCOUNT_ID
  ),
  /** Cloudflare Pages Project Name */
  cloudflareProjectName: Config.schema(
    Schema.Trim,
    INPUT_KEY_CLOUDFLARE_PROJECT_NAME
  ),
  /** Directory of static files to upload */
  directory: Config.schema(Schema.Trim, INPUT_KEY_DIRECTORY),
  workingDirectory: Config.schema(
    Schema.Trim,
    INPUT_KEY_WORKING_DIRECTORY
  ).pipe(
    Config.withDefault('.'),
    Config.map(directory => checkWorkingDirectory(directory))
  ),
  /**
   * Branch name override for Cloudflare Pages deployment. `undefined` is the
   * meaningful absent value here — callers treat it as "no override" — and
   * `unicorn/no-null` rules out the alternative.
   */
  branch: Config.schema(Schema.Trim, INPUT_KEY_BRANCH).pipe(
    // oxlint-disable-next-line unicorn/no-useless-undefined
    Config.withDefault(undefined)
  )
})

type UseInputs = Effect.Success<typeof inputsConfig>

let _inputs: UseInputs

/**
 * Memoises success only. `Effect.cached` is deliberately not used: it caches the
 * `Exit`, so a first failure would be replayed forever, and the tests rely on a
 * failed read becoming a successful one once more env is stubbed.
 *
 * Stays synchronous because callers such as the `openapi-fetch` request
 * middleware cannot await.
 */
export const useInputs = (): UseInputs =>
  _inputs ?? (_inputs = Effect.runSync(inputsConfig.parse(actionInputProvider)))
