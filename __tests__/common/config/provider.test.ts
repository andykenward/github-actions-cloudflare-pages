import {getInput} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {describe, expect, vi} from 'vitest'

import {input, optionalInput, readInputs} from '@/common/config/provider.js'
import {errorMessage} from '@/common/errors.js'
import {INPUT_KEYS_KEEP_LATEST} from '@/input-keys'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

describe(readInputs, () => {
  it.effect('reads the env when it runs, not when it is created', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      const name = readInputs(input('name'))

      stubInputEnv('name', 'late')

      expect(yield* name).toBe('late')
    })
  )
})

describe(input, () => {
  it.effect.each([
    {key: 'keep-latest'},
    {key: 'pr number'},
    {key: 'Mixed-Case key'}
  ])('reads and trims $key as getInput does', ({key}) =>
    Effect.gen(function* () {
      expect.assertions(2)

      stubInputEnv(key, '  value  ')

      expect(getInput(key)).toBe('value')
      expect(yield* readInputs(input(key))).toBe('value')
    })
  )

  it.effect('keeps hyphens rather than reading the constant-case name', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubInputEnv(INPUT_KEYS_KEEP_LATEST, '')
      vi.stubEnv('INPUT_KEEP_LATEST', '3')

      const error = yield* Effect.flip(
        readInputs(input(INPUT_KEYS_KEEP_LATEST))
      )

      expect(errorMessage(error)).toBe(
        'Input required and not supplied: keep-latest'
      )
    })
  )
})

describe(optionalInput, () => {
  it.effect.each([
    {supplied: 'absent', value: undefined, expected: undefined},
    {supplied: 'empty', value: '', expected: undefined},
    // `getInput` trims it to '', which `|| undefined` treated as absent.
    {supplied: 'only whitespace', value: '   ', expected: undefined},
    {supplied: 'a value', value: ' value ', expected: 'value'}
  ])('reads $expected when $supplied', ({value, expected}) =>
    Effect.gen(function* () {
      expect.assertions(1)

      if (value !== undefined) {
        stubInputEnv('optional', value)
      }

      expect(yield* readInputs(optionalInput('optional'))).toBe(expected)
    })
  )
})
