import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {beforeEach, describe, expect, vi} from 'vitest'

import {errorMessage} from '@/common/errors.js'
import {DeployInputs} from '@/deploy/inputs.js'
import {INPUT_KEY_BRANCH} from '@/input-keys'
import {stubInputEnv, stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

/** Builds the layer when run, so env stubbed beforehand is picked up. */
const deployInputs = Effect.gen(function* () {
  return yield* DeployInputs
}).pipe(Effect.provide(DeployInputs.layer))

describe(DeployInputs, () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it.effect('returns correct values', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubRequiredInputEnv()

      expect(yield* deployInputs).toStrictEqual({
        cloudflareAccountId: 'mock-cloudflare-account-id',
        cloudflareProjectName: 'mock-cloudflare-project-name',
        directory: 'mock-directory',
        workingDirectory: '.',
        branch: undefined
      })
    })
  )

  it.effect('fails naming the first missing input', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      const error = yield* Effect.flip(deployInputs)

      expect(errorMessage(error)).toBe(
        'Input required and not supplied: cloudflare-account-id'
      )
    })
  )

  it.effect('returns branch when provided', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      stubRequiredInputEnv()
      stubInputEnv(INPUT_KEY_BRANCH, 'pr-123')

      expect(yield* deployInputs).toStrictEqual({
        cloudflareAccountId: 'mock-cloudflare-account-id',
        cloudflareProjectName: 'mock-cloudflare-project-name',
        directory: 'mock-directory',
        workingDirectory: '.',
        branch: 'pr-123'
      })
    })
  )
})
