import {debug, setFailed} from '@actions/core'
import * as Cause from 'effect/Cause'
import * as Config from 'effect/Config'
import * as ConfigProvider from 'effect/ConfigProvider'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'
import {describe, expect, test, vi} from 'vitest'

import {actionInputProvider} from '@/common/config/provider.js'
import {errorMessage, reportFailure} from '@/common/errors.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEYS_KEEP_LATEST
} from '@/input-keys'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

vi.mock(import('@actions/core'))

/** Parses `config` against the action inputs and returns its failure. */
const configError = <A>(config: Config.Config<A>): Config.ConfigError =>
  Effect.runSync(Effect.flip(config.parse(actionInputProvider)))

describe(errorMessage, () => {
  test('names a missing input', () => {
    expect.assertions(1)

    stubInputEnv(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, '')

    expect(
      errorMessage(
        configError(Config.schema(Schema.Trim, INPUT_KEY_CLOUDFLARE_ACCOUNT_ID))
      )
    ).toBe('Input required and not supplied: cloudflare-account-id')
  })

  test('names a missing secret input', () => {
    expect.assertions(1)

    stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN, '')

    expect(
      errorMessage(configError(Config.redacted(INPUT_KEY_CLOUDFLARE_API_TOKEN)))
    ).toBe('Input required and not supplied: cloudflare-api-token')
  })

  test('describes an invalid input', () => {
    expect.assertions(1)

    stubInputEnv(INPUT_KEYS_KEEP_LATEST, 'abc')

    expect(errorMessage(configError(Config.int(INPUT_KEYS_KEEP_LATEST)))).toBe(
      "Input 'keep-latest' is invalid: Expected a string representing a finite number"
    )
  })

  test('uses the source message when no one input is at fault', () => {
    expect.assertions(1)

    expect(
      errorMessage(
        configError(
          Config.fail(
            new ConfigProvider.SourceError({message: 'connection refused'})
          )
        )
      )
    ).toBe('connection refused')
  })

  test('uses an Error message', () => {
    expect.assertions(1)

    expect(errorMessage(new Error('boom'))).toBe('boom')
  })

  test('stringifies other values', () => {
    expect.assertions(1)

    expect(errorMessage('boom')).toBe('boom')
  })
})

describe(reportFailure, () => {
  test('fails with the message and debugs the full cause', () => {
    expect.assertions(2)

    reportFailure(Cause.fail(new Error('boom')))

    expect(setFailed).toHaveBeenLastCalledWith('boom')
    expect(debug).toHaveBeenLastCalledWith(
      expect.stringMatching(/Error: boom\n\s+at /)
    )
  })

  test('fails with a missing input by name, not the error object', () => {
    expect.assertions(1)

    stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN, '')

    reportFailure(
      Cause.fail(configError(Config.redacted(INPUT_KEY_CLOUDFLARE_API_TOKEN)))
    )

    expect(setFailed).toHaveBeenLastCalledWith(
      'Input required and not supplied: cloudflare-api-token'
    )
  })

  test('fails with a defect message', () => {
    expect.assertions(1)

    reportFailure(Cause.die(new Error('kaput')))

    expect(setFailed).toHaveBeenLastCalledWith('kaput')
  })
})
