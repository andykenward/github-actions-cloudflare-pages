import {describe, expect, test} from 'vitest'

import {getCloudflareApiEndpoint} from '@/src/cloudflare/api/endpoints.js'
import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_PROJECT_NAME
} from '@/src/constants.js'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

describe('getCloudflareApiEndpoint', () => {
  test('returns correct url', () => {
    stubInputEnv(ACTION_INPUT_ACCOUNT_ID, 'mock-account-id')
    stubInputEnv(ACTION_INPUT_PROJECT_NAME, 'mock-project-name')

    const url = getCloudflareApiEndpoint()

    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name`
    )
  })

  test('appends path argument', () => {
    stubInputEnv(ACTION_INPUT_ACCOUNT_ID, 'mock-account-id')
    stubInputEnv(ACTION_INPUT_PROJECT_NAME, 'mock-project-name')

    const url = getCloudflareApiEndpoint('mock-deployment')

    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name/mock-deployment`
    )

    const urlParams = getCloudflareApiEndpoint(`deployments/${123}?force=true`)

    expect(urlParams).toMatchInlineSnapshot(
      '"https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name/deployments/123?force=true"'
    )
  })

  test.each([
    {
      input: ACTION_INPUT_ACCOUNT_ID,
      value: 'mock-account-id',
      expected: ACTION_INPUT_PROJECT_NAME
    },
    {
      input: ACTION_INPUT_PROJECT_NAME,
      value: 'mock-project-id',
      expected: ACTION_INPUT_ACCOUNT_ID
    }
  ])(
    `$input with $value throws error $expected`,
    ({input, value, expected}) => {
      stubInputEnv(input, value)

      expect(() => getCloudflareApiEndpoint()).toThrow(
        `Input required and not supplied: ${expected}`
      )
    }
  )
})
