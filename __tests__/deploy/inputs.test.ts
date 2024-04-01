import {beforeEach, describe, expect, test, vi} from 'vitest'

import {stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

import {useInputs} from '@/deploy/inputs.js'

describe('deploy', () => {
  describe('inputs', () => {
    beforeEach(() => {
      vi.unstubAllEnvs()
    })

    test('returns correct values', () => {
      expect.assertions(1)

      stubRequiredInputEnv()
      const inputs = useInputs()

      expect(inputs).toMatchInlineSnapshot(`
      {
        "cloudflareAccountId": "mock-cloudflare-account-id",
        "cloudflareProjectName": "mock-cloudflare-project-name",
        "directory": "mock-directory",
        "workingDirectory": ".",
      }
    `)
    })
  })
})
