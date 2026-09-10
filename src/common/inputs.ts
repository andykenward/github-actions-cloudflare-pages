import {setSecret} from '@actions/core'
import * as Config from 'effect/Config'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Redacted from 'effect/Redacted'
import * as Schema from 'effect/Schema'

import {readInputs} from '@/common/config/provider.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
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

const commonConfig = Config.all({
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

/**
 * Inputs used by both actions.
 *
 * `Effect.provide` builds a layer once per run and shares it with everything
 * that needs it, so the inputs are parsed once without a module-level cache —
 * and each test run builds its own, so a failed parse is never replayed.
 */
export class CommonInputs extends Context.Service<
  CommonInputs,
  Effect.Success<typeof commonConfig>
>()('github-actions-cloudflare-pages/common/inputs/CommonInputs') {
  /**
   * Registers both tokens with the runner's log masking. Values from
   * `secrets.*` are masked automatically, but a token passed from a step
   * output or a plain env var is not.
   */
  static readonly layer = Layer.effect(
    CommonInputs,
    Effect.gen(function* () {
      const inputs = yield* readInputs(commonConfig)
      setSecret(secret(inputs.cloudflareApiToken))
      setSecret(secret(inputs.gitHubApiToken))
      return CommonInputs.of(inputs)
    })
  )
}

const payloadV1Config = Config.all({
  accountId: Config.schema(Schema.Trim, INPUT_KEY_CLOUDFLARE_ACCOUNT_ID),
  projectName: Config.schema(Schema.Trim, INPUT_KEY_CLOUDFLARE_PROJECT_NAME)
})

/**
 * The Cloudflare account and project for legacy V1 deployment payloads, which
 * did not embed them.
 *
 * These inputs are optional for the delete action, so they are read lazily —
 * only once a V1 payload turns up — and `Effect.cached` parses them at most
 * once per run, however many V1 payloads there are.
 */
export class PayloadV1Inputs extends Context.Service<
  PayloadV1Inputs,
  {
    readonly cloudflare: Effect.Effect<
      Effect.Success<typeof payloadV1Config>,
      Config.ConfigError
    >
  }
>()('github-actions-cloudflare-pages/common/inputs/PayloadV1Inputs') {
  static readonly layer = Layer.effect(
    PayloadV1Inputs,
    Effect.cached(readInputs(payloadV1Config)).pipe(
      Effect.map(cloudflare => PayloadV1Inputs.of({cloudflare}))
    )
  )
}

/** Reads a redacted token for use in an outgoing request or child process. */
export const secret = (value: Redacted.Redacted<string>): string =>
  Redacted.value(value)
