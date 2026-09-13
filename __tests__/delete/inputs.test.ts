import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {beforeEach, describe, expect, vi} from 'vitest'

import {errorMessage} from '@/common/errors.js'
import {DeleteInputs} from '@/delete/inputs.js'
import {INPUT_KEY_GITHUB_ENVIRONMENT, INPUT_KEY_KEEP_LATEST} from '@/input-keys'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

/** Builds the layer when run, so env stubbed beforehand is picked up. */
const deleteInputs = Effect.gen(function* () {
  return yield* DeleteInputs
}).pipe(Effect.provide(DeleteInputs.layer))

describe(DeleteInputs, () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it.effect('defaults keep-latest to 0 and github-environment to none', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      expect(yield* deleteInputs).toStrictEqual({
        keepLatest: 0,
        gitHubEnvironment: undefined
      })
    })
  )

  it.effect('defaults keep-latest to 0 when empty', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_KEEP_LATEST, '')

      expect((yield* deleteInputs).keepLatest).toBe(0)
    })
  )

  it.effect('parses keep-latest and github-environment', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_KEEP_LATEST, '3')
      stubInputEnv(INPUT_KEY_GITHUB_ENVIRONMENT)

      expect(yield* deleteInputs).toStrictEqual({
        keepLatest: 3,
        gitHubEnvironment: 'mock-github-environment'
      })
    })
  )

  it.effect.each([
    {
      value: 'abc',
      expected: 'Expected a string representing a finite number'
    },
    {value: '1.5', expected: 'Expected an integer'},
    // Previously accepted: `deployments.slice(-1)` kept only the oldest.
    {value: '-1', expected: 'Expected a value greater than or equal to 0'},
    // More than one listing can hold.
    {value: '10001', expected: 'Expected a value less than or equal to 10000'}
  ])('fails for a keep-latest of $value', ({value, expected}) =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_KEEP_LATEST, value)

      expect(errorMessage(yield* Effect.flip(deleteInputs))).toBe(
        `Input 'keep-latest' is invalid: ${expected}`
      )
    })
  )
})
