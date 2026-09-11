import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {describe, expect} from 'vitest'

import {errorMessage} from '@/common/errors.js'
import {DeleteInputs} from '@/delete/inputs.js'
import {INPUT_KEYS_KEEP_LATEST} from '@/input-keys'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

/** Builds the layer when run, so env stubbed beforehand is picked up. */
const deleteInputs = Effect.gen(function* () {
  return yield* DeleteInputs
}).pipe(Effect.provide(DeleteInputs.layer))

describe(DeleteInputs, () => {
  it.effect('defaults keep-latest to 0 when not supplied', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEYS_KEEP_LATEST, '')

      expect(yield* deleteInputs).toStrictEqual({keepLatest: 0})
    })
  )

  it.effect('parses keep-latest', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEYS_KEEP_LATEST, '3')

      expect(yield* deleteInputs).toStrictEqual({keepLatest: 3})
    })
  )

  it.effect('fails for a keep-latest that is not a number', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEYS_KEEP_LATEST, 'abc')

      expect(errorMessage(yield* Effect.flip(deleteInputs))).toBe(
        "Input 'keep-latest' is invalid: Expected a string representing a finite number"
      )
    })
  )
})
