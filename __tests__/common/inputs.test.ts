import {beforeEach, describe, expect, test, vi} from 'vitest'

import {stubInputEnv} from '@/tests/helpers/inputs.js'

import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_GITHUB_TOKEN
} from '@/input-keys'

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

      expect(() => useCommonInputs()).toThrow(
        /input required and not supplied: cloudflare-api-token/i
      )

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)

      expect(() => useCommonInputs()).toThrow(
        /input required and not supplied: github-token/i
      )

      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      expect(() => useCommonInputs()).not.toThrow()
    })

    test('returns correct values', async () => {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_ENVIRONMENT)

      const {useCommonInputs} = await setup()

      expect(useCommonInputs()).toStrictEqual({
        cloudflareApiToken: 'mock-cloudflare-api-token',
        gitHubApiToken: 'mock-github-token',
        gitHubEnvironment: 'mock-github-environment'
      })
    })

    test(`returns undefined for optional ${INPUT_KEY_GITHUB_ENVIRONMENT}`, async () => {
      expect.assertions(1)

      stubInputEnv(INPUT_KEY_CLOUDFLARE_API_TOKEN)
      stubInputEnv(INPUT_KEY_GITHUB_TOKEN)

      const {useCommonInputs} = await setup()

      expect(useCommonInputs()).toStrictEqual({
        cloudflareApiToken: 'mock-cloudflare-api-token',
        gitHubApiToken: 'mock-github-token',
        gitHubEnvironment: undefined
      })
    })
  })
})
