import type * as Config from 'effect/Config'

import * as ConfigProvider from 'effect/ConfigProvider'
import * as Effect from 'effect/Effect'
import * as Predicate from 'effect/Predicate'

/**
 * Resolves `Config` paths against the `INPUT_*` environment variables that the
 * GitHub Actions runner sets, matching `@actions/core` `getInput` exactly:
 *
 * ```
 * INPUT_ + name.replace(/ /g, '_').toUpperCase()
 * ```
 *
 * Only spaces become underscores — hyphens are preserved, so `keep-latest`
 * resolves `INPUT_KEEP-LATEST`. `ConfigProvider.constantCase` cannot be used
 * here: it strips non-alphanumerics and would look up `INPUT_KEEP_LATEST`,
 * which the runner never sets.
 *
 * Built from `fromEnvRecord(process.env)` rather than the default provider.
 * The default is a `Context.Reference` whose `defaultValue` snapshots
 * `process.env` once and is then cached on the reference forever, so it cannot
 * see `vi.stubEnv` changes between tests. `fromEnvRecord` re-reads the record
 * on every lookup.
 *
 * Empty strings are treated as missing (the provider default), which reproduces
 * both `getInput(..., {required: true})` throwing and the `|| undefined` idiom
 * used for optional inputs.
 */
export const actionInputProvider: ConfigProvider.ConfigProvider =
  ConfigProvider.fromEnvRecord(process.env).pipe(
    ConfigProvider.mapInput((path: ReadonlyArray<string | number>) =>
      path.map(segment =>
        Predicate.isNumber(segment)
          ? segment
          : segment.replaceAll(' ', '_').toUpperCase()
      )
    ),
    ConfigProvider.nested('INPUT')
  )

/**
 * Parses `config` against the action inputs each time the effect runs.
 *
 * `config.parse(provider)` reads the environment when it is *called* and
 * returns an already-resolved Effect, so calling it at module scope — e.g. as
 * a layer's effect — would capture the env at import time.
 */
export const readInputs = <A>(
  config: Config.Config<A>
): Effect.Effect<A, Config.ConfigError> =>
  Effect.suspend(() => config.parse(actionInputProvider))
