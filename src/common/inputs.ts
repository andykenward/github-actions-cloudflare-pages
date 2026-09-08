import * as Config from 'effect/Config'
import * as Effect from 'effect/Effect'
import * as Redacted from 'effect/Redacted'
import * as Schema from 'effect/Schema'

import {actionInputProvider} from '@/common/config/provider.js'
import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_PR_NUMBER,
  INPUT_KEY_GITHUB_TOKEN,
  INPUT_KEY_WRANGLER_VERSION
} from '@/input-keys'

/**
 * Kept in lockstep with `devDependencies.wrangler` by `bin/sync-versions.ts`,
 * which matches this declaration by regex — keep the shape of this line stable.
 */
const DEFAULT_WRANGLER_VERSION = '4.113.0'

const inputsConfig = Config.all({
  /** Cloudflare API token */
  cloudflareApiToken: Config.redacted(INPUT_KEY_CLOUDFLARE_API_TOKEN),
  /** GitHub API Token */
  gitHubApiToken: Config.redacted(INPUT_KEY_GITHUB_TOKEN),
  /** GitHub Environment to use for deployment */
  gitHubEnvironment: Config.schema(
    Schema.Trim,
    INPUT_KEY_GITHUB_ENVIRONMENT
    // oxlint-disable-next-line unicorn/no-useless-undefined
  ).pipe(Config.withDefault(undefined)),
  /** Pull request number to use for comment creation. */
  prNumber: Config.schema(
    Schema.Trim,
    INPUT_KEY_PR_NUMBER
    // oxlint-disable-next-line unicorn/no-useless-undefined
  ).pipe(Config.withDefault(undefined)),
  /** Wrangler version to use. */
  wranglerVersion: Config.schema(Schema.Trim, INPUT_KEY_WRANGLER_VERSION).pipe(
    Config.withDefault(DEFAULT_WRANGLER_VERSION)
  )
})

type UseCommonInputs = Effect.Success<typeof inputsConfig>

let _inputs: UseCommonInputs

/** Memoises success only — see the note in `src/deploy/inputs.ts`. */
export const useCommonInputs = (): UseCommonInputs =>
  _inputs ?? (_inputs = Effect.runSync(inputsConfig.parse(actionInputProvider)))

/** Reads a redacted token for use in an outgoing request or child process. */
export const secret = (value: Redacted.Redacted<string>): string =>
  Redacted.value(value)
