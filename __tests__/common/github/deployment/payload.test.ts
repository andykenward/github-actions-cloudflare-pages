import {describe, expect, test, vi} from 'vitest'

import {stubInputEnv} from '@/tests/helpers/inputs.js'

import type {Payload} from '@/common/github/deployment/payload.js'
import type {
  PayloadGithubDeployment,
  PayloadGithubDeploymentV2
} from '@/common/github/deployment/types.js'

import {getPayload} from '@/common/github/deployment/payload.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME
} from '@/input-keys'

const PAYLOAD_V1 = {
  cloudflareId: 'cf-id',
  commentId: 'comment-id-123',
  url: 'https://example.com'
} as const satisfies PayloadGithubDeployment

const PAYLOAD_V2 = {
  cloudflare: {
    id: 'cf-id',
    accountId: 'cf-account-id',
    projectName: 'cf-project'
  },
  commentId: 'comment-id-123',
  url: 'https://example.com'
} as const satisfies PayloadGithubDeploymentV2

describe(getPayload, () => {
  //   const spyGetInput = vi.spyOn(core, 'getInput')

  test('returns payload if it is already a PayloadGithubDeploymentV2', () => {
    expect.assertions(1)

    const result = getPayload(PAYLOAD_V2)

    expect(result).toMatchInlineSnapshot(`
      {
        "cloudflare": {
          "accountId": "cf-account-id",
          "id": "cf-id",
          "projectName": "cf-project",
        },
        "commentId": "comment-id-123",
        "url": "https://example.com",
      }
    `)
  })

  test('returns transformed payload for old payloads', () => {
    expect.assertions(1)

    const result = getPayload(PAYLOAD_V1)

    expect(result).toMatchInlineSnapshot(`
      {
        "cloudflare": {
          "accountId": "mock-cloudflare-account-id",
          "id": "cf-id",
          "projectName": "mock-cloudflare-project-name",
        },
        "commentId": "comment-id-123",
        "url": "https://example.com",
      }
    `)
  })

  describe('errors', () => {
    const BAD_PAYLOADS: Array<[Payload]> = [
      [
        {
          invalidData: 'invalid'
        }
      ],
      [
        {
          cloudflareId: 'cf-id'
        }
      ],
      [
        {
          cloudflare: undefined
        }
      ],
      [
        {
          cloudflare: {}
        }
      ],
      [
        {
          cloudflare: {
            id: 'cf-id'
          }
        }
      ],
      [
        {
          cloudflare: {
            id: 'cf-id',
            accountId: 'cf-account-id'
          }
        }
      ],
      [
        {
          cloudflare: {
            id: 'cf-id',
            accountId: 'cf-account-id',
            projectName: 'cf-project'
          }
        }
      ]
    ]

    test.each(BAD_PAYLOADS)('throws an error for invalid payloads', () => {
      expect.assertions(1)

      const payload = {
        invalidData: 'invalid'
      }

      expect(() => {
        getPayload(payload)
      }).toThrowError('Payload is not valid')
    })

    test('throws an error for payloads v1 and missing inputs', () => {
      expect.assertions(3)

      vi.unstubAllEnvs()

      expect(() => {
        getPayload(PAYLOAD_V1)
      }).toThrowError('Input required and not supplied: cloudflare-account-id')

      stubInputEnv(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID)

      expect(() => {
        getPayload(PAYLOAD_V1)
      }).toThrowError(
        'Input required and not supplied: cloudflare-project-name'
      )

      stubInputEnv(INPUT_KEY_CLOUDFLARE_PROJECT_NAME)

      expect(() => {
        getPayload(PAYLOAD_V1)
      }).not.toThrowError()
    })
  })
})
