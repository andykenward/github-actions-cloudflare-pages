import {describe, expect, test} from 'vitest'

import {getCloudflareApiEndpoint} from '../../../cloudflare/api/endpoints.js'
import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_PROJECT_NAME
} from '../../../constants.js'
import {setInputEnv} from '../../helpers/inputs.js'

describe('getCloudflareApiEndpoint', () => {
  test('returns correct url', () => {
    setInputEnv(ACTION_INPUT_ACCOUNT_ID, 'mock-account-id')
    setInputEnv(ACTION_INPUT_PROJECT_NAME, 'mock-project-name')

    const url = getCloudflareApiEndpoint()

    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name`
    )
  })

  test('appends path argument', () => {
    setInputEnv(ACTION_INPUT_ACCOUNT_ID, 'mock-account-id')
    setInputEnv(ACTION_INPUT_PROJECT_NAME, 'mock-project-name')

    const url = getCloudflareApiEndpoint('mock-deployment')

    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name/mock-deployment`
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
      setInputEnv(input, value)

      expect(() => getCloudflareApiEndpoint()).toThrow(
        `Input required and not supplied: ${expected}`
      )
    }
  )
})
