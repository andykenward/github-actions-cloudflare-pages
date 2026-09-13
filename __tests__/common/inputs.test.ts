import {setSecret} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import * as Exit from 'effect/Exit'
import * as Redacted from 'effect/Redacted'
import {beforeEach, describe, expect, vi} from 'vitest'

import {readInputs} from '@/common/config/provider.js'
import {errorMessage} from '@/common/errors.js'
import {
  CommonInputs,
  PayloadV1Inputs,
  wranglerVersionConfig
} from '@/common/inputs.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
  INPUT_KEY_GITHUB_TOKEN,
  INPUT_KEY_WRANGLER_VERSION
} from '@/input-keys'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

import packageJson from '../../package.json' with {type: 'json'}

vi.mock(import('@actions/core'))

/** Builds the layer when run, so env stubbed beforehand is picked up. */
const commonInputs = Effect.gen(function* () {
  return yield* CommonInputs
}).pipe(Effect.provide(CommonInputs.layer))

describe(CommonInputs, () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it.effect('should fail when missing inputs', () =>
    Effect.gen(function* () {
      expect.assertions(3)

      expect(errorMessage(yield* Effect.flip(commonInputs))).toMatch(
        /cloudflare-api-token/
      )

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)

      expect(errorMessage(yield* Effect.flip(commonInputs))).toMatch(
        /github-token/
      )

      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      // Each run builds the layer afresh, so the earlier failures are not
      // replayed.
      expect(Exit.isSuccess(yield* Effect.exit(commonInputs))).toBe(true)
    })
  )

  it.effect('masks both tokens in the log', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      yield* commonInputs

      expect(setSecret).toHaveBeenCalledWith('mock-cloudflare-api-token')
      expect(setSecret).toHaveBeenCalledWith('mock-github-token')
    })
  )

  it.effect('returns the tokens', () =>
    Effect.gen(function* () {
      expect.assertions(2)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      const inputs = yield* commonInputs

      // Unwrap explicitly: a `Redacted` holds its value in a WeakMap, so
      // comparing two Redacted instances passes regardless of the secret.
      expect(Redacted.value(inputs.cloudflareApiToken)).toBe(
        'mock-cloudflare-api-token'
      )
      expect(Redacted.value(inputs.gitHubApiToken)).toBe('mock-github-token')
    })
  )
})

// A `Config` value, not a function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('wranglerVersionConfig', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  const wranglerVersion = readInputs(wranglerVersionConfig)

  it.effect('returns the input', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_WRANGLER_VERSION)

      expect(yield* wranglerVersion).toBe('mock-wrangler-version')
    })
  )

  it.effect.each([{value: ''}, {value: '   '}])(
    'uses the default for a blank input $value',
    ({value}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        // Trimmed to '', it would otherwise install `wrangler@`.
        stubInputEnv(INPUT_KEY_WRANGLER_VERSION, value)

        expect(yield* wranglerVersion).toBe(
          packageJson.devDependencies.wrangler
        )
      })
  )
})

describe(PayloadV1Inputs, () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it.effect('builds without the inputs and reads them only when used', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      const {cloudflare} = yield* PayloadV1Inputs

      expect(errorMessage(yield* Effect.flip(cloudflare))).toBe(
        'Input required and not supplied: cloudflare-account-id'
      )
    }).pipe(Effect.provide(PayloadV1Inputs.layer))
  )

  it.effect('parses the inputs once per run', () => {
    stubInputEnv(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID)
    stubInputEnv(INPUT_KEY_CLOUDFLARE_PROJECT_NAME)

    return Effect.gen(function* () {
      expect.assertions(2)

      const {cloudflare} = yield* PayloadV1Inputs
      const first = yield* cloudflare

      stubInputEnv(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, 'changed')

      expect(first.accountId).toBe('mock-cloudflare-account-id')
      expect(yield* cloudflare).toBe(first)
    }).pipe(Effect.provide(PayloadV1Inputs.layer))
  })
})
