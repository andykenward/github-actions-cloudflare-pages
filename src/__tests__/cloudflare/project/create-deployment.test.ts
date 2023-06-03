import {beforeAll, beforeEach, describe, expect, test, vi} from 'vitest'
import wrangler from 'wrangler'

import {createDeployment} from '../../../cloudflare/project/create-deployment.js'
import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_API_TOKEN,
  ACTION_INPUT_DIRECTORY,
  ACTION_INPUT_PROJECT_NAME,
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN
} from '../../../constants.js'
import {setInputEnv} from '../../helpers/inputs.js'

const REQUIRED_INPUTS = [
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_PROJECT_NAME,
  ACTION_INPUT_DIRECTORY,
  ACTION_INPUT_API_TOKEN
] as const

const EACH_REQUIRED_INPUTS = REQUIRED_INPUTS.map(input => ({
  expected: input,
  inputs: REQUIRED_INPUTS.filter(a => a !== input)
}))

vi.mock('wrangler')

describe('create-deployment', () => {
  beforeEach(() => {
    process.env['GITHUB_HEAD_REF'] = 'mock-branch'
    process.env['GITHUB_SHA'] = 'mock-hash-123'
  })

  test.each(EACH_REQUIRED_INPUTS)(
    `throws error when required input $expected is undefined`,
    async ({expected, inputs}) => {
      for (const input of inputs) {
        setInputEnv(input, input)
      }

      await expect(() => createDeployment()).rejects.toThrow(
        `Input required and not supplied: ${expected}`
      )

      expect(wrangler.unstable_pages.deploy).not.toHaveBeenCalled()
    }
  )

  test('sets Cloudflare env so wrangler works', async () => {
    expect.assertions(7)

    for (const input of REQUIRED_INPUTS) {
      setInputEnv(input, `mock-${input}`)
    }

    expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
    expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

    await expect(createDeployment()).resolves.toMatchInlineSnapshot(`
      {
        "id": "deploy-id",
      }
    `)
    expect(process.env[CLOUDFLARE_API_TOKEN]).toStrictEqual('mock-apiToken')
    expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toStrictEqual('mock-accountId')

    expect(wrangler.unstable_pages.deploy).toHaveBeenCalledWith({
      accountId: 'mock-accountId',
      branch: 'mock-branch',
      commitHash: 'mock-hash-123',
      directory: 'mock-directory',
      projectName: 'mock-projectName'
    })
    expect(wrangler.unstable_pages.deploy).toHaveBeenCalledTimes(1)
  })

  test('throws error from wrangler deploy', async () => {
    expect.assertions(7)
    vi.mocked(wrangler.unstable_pages.deploy).mockRejectedValueOnce(
      'something went wrong'
    )
    for (const input of REQUIRED_INPUTS) {
      setInputEnv(input, `mock-${input}`)
    }

    expect(process.env[CLOUDFLARE_API_TOKEN]).toBeUndefined()
    expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toBeUndefined()

    await expect(createDeployment()).rejects.toThrow(`something went wrong`)
    expect(process.env[CLOUDFLARE_API_TOKEN]).toStrictEqual('mock-apiToken')
    expect(process.env[CLOUDFLARE_ACCOUNT_ID]).toStrictEqual('mock-accountId')

    expect(wrangler.unstable_pages.deploy).toHaveBeenCalledWith({
      accountId: 'mock-accountId',
      branch: 'mock-branch',
      commitHash: 'mock-hash-123',
      directory: 'mock-directory',
      projectName: 'mock-projectName'
    })
    expect(wrangler.unstable_pages.deploy).toHaveBeenCalledTimes(1)
  })
})
