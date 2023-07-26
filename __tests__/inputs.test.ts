import {beforeEach, describe, expect, test, vi} from 'vitest'

import {useInputs} from '@/src/inputs.js'

import {stubRequiredInputEnv} from './helpers/index.js'

describe('inputs', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  test('returns correct values', () => {
    stubRequiredInputEnv()
    const inputs = useInputs()

    expect(inputs).toMatchInlineSnapshot(`
      {
        "cloudflareAccountId": "mock-cloudflare-account-id",
        "cloudflareApiToken": "mock-cloudflare-api-token",
        "cloudflareProjectName": "mock-cloudflare-project-name",
        "directory": "mock-directory",
        "gitHubApiToken": "mock-github-token",
        "gitHubEnvironment": "mock-github-environment",
      }
    `)
  })
})
