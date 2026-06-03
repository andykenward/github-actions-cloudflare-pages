import {beforeEach, describe, expect, test, vi} from 'vitest'

import {INPUT_KEY_BRANCH} from '@/input-keys'
import {stubInputEnv, stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

const setup = async () => {
  return await import('@/deploy/inputs.js')
}

describe('deploy', () => {
  describe('inputs', () => {
    beforeEach(() => {
      vi.resetModules()
      vi.unstubAllEnvs()
    })

    test('returns correct values', async () => {
      expect.assertions(1)

      stubRequiredInputEnv()
      const {useInputs} = await setup()

      expect(useInputs()).toStrictEqual({
        cloudflareAccountId: 'mock-cloudflare-account-id',
        cloudflareProjectName: 'mock-cloudflare-project-name',
        directory: 'mock-directory',
        workingDirectory: '.',
        branch: undefined
      })
    })

    test('throws error', async () => {
      expect.assertions(1)

      const {useInputs} = await setup()

      expect(() => useInputs()).toThrow(
        'Input required and not supplied: cloudflare-account-id'
      )
    })

    test('returns branch when provided', async () => {
      expect.assertions(1)

      stubRequiredInputEnv()
      stubInputEnv(INPUT_KEY_BRANCH, 'pr-123')
      const {useInputs} = await setup()

      expect(useInputs()).toStrictEqual({
        cloudflareAccountId: 'mock-cloudflare-account-id',
        cloudflareProjectName: 'mock-cloudflare-project-name',
        directory: 'mock-directory',
        workingDirectory: '.',
        branch: 'pr-123'
      })
    })
  })
})
