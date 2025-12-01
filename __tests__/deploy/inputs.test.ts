import {beforeEach, describe, expect, test, vi} from 'vitest'

import {stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

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
        workingDirectory: '.'
      })
    })

    test('throws error', async () => {
      expect.assertions(1)

      const {useInputs} = await setup()

      expect(() => useInputs()).toThrowError(
        'Input required and not supplied: cloudflare-account-id'
      )
    })
  })
})
