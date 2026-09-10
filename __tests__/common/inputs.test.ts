import * as Redacted from 'effect/Redacted'
import {beforeEach, describe, expect, test, vi} from 'vitest'

import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_GITHUB_TOKEN,
  INPUT_KEY_WRANGLER_VERSION
} from '@/input-keys'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

import packageJson from '../../package.json' with {type: 'json'}

vi.mock(import('@actions/core'))

const setup = async () => {
  return await import('@/common/inputs.js')
}

describe('common', () => {
  describe('inputs', () => {
    beforeEach(() => {
      vi.resetModules()
      vi.unstubAllEnvs()
    })

    test('should error when missing inputs', async () => {
      expect.assertions(3)

      const {useCommonInputs} = await setup()

      expect(() => useCommonInputs()).toThrow(/cloudflare-api-token/)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)

      expect(() => useCommonInputs()).toThrow(/github-token/)

      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      expect(() => useCommonInputs()).not.toThrow()
    })

    test('masks both tokens in the log', async () => {
      expect.assertions(2)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      const {useCommonInputs} = await setup()
      // Same module instance as the one `inputs.js` imported after the reset.
      const {setSecret} = await import('@actions/core')

      useCommonInputs()

      expect(setSecret).toHaveBeenCalledWith('mock-cloudflare-api-token')
      expect(setSecret).toHaveBeenCalledWith('mock-github-token')
    })

    test('returns correct values', async () => {
      expect.assertions(3)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_ENVIRONMENT)
      stubInputEnv(INPUT_KEY_WRANGLER_VERSION)

      const {useCommonInputs} = await setup()

      const inputs = useCommonInputs()

      // Unwrap explicitly: a `Redacted` holds its value in a WeakMap, so
      // comparing two Redacted instances passes regardless of the secret.
      expect(Redacted.value(inputs.cloudflareApiToken)).toBe(
        'mock-cloudflare-api-token'
      )
      expect(Redacted.value(inputs.gitHubApiToken)).toBe('mock-github-token')
      expect(inputs).toStrictEqual(
        expect.objectContaining({
          gitHubEnvironment: 'mock-github-environment',
          prNumber: undefined,
          wranglerVersion: 'mock-wrangler-version'
        })
      )
    })

    test(`returns undefined for optional ${INPUT_KEY_GITHUB_ENVIRONMENT}`, async () => {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      const {useCommonInputs} = await setup()

      expect(useCommonInputs()).toStrictEqual(
        expect.objectContaining({
          gitHubEnvironment: undefined,
          prNumber: undefined,
          wranglerVersion: packageJson.devDependencies.wrangler
        })
      )
    })

    test('returns default wranger version', async () => {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      const {useCommonInputs} = await setup()

      expect(useCommonInputs()).toStrictEqual(
        expect.objectContaining({
          wranglerVersion: packageJson.devDependencies.wrangler
        })
      )
    })
  })
})
