import * as ConfigProvider from 'effect/ConfigProvider'
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
