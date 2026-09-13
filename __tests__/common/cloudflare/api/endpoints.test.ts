import {describe, expect, test} from 'vitest'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'

describe('endpoints', () => {
  describe(getCloudflareLogEndpoint, () => {
    test('returns correct url', () => {
      expect.assertions(1)

      const url = getCloudflareLogEndpoint({
        id: '123',
        accountId: 'mock-cloudflare-account-id',
        projectName: 'mock-cloudflare-project-name'
      })

      expect(url).toMatchInlineSnapshot(
        '"https://dash.cloudflare.com/mock-cloudflare-account-id/pages/view/mock-cloudflare-project-name/123"'
      )
    })

    test('encodes each segment', () => {
      expect.assertions(1)

      expect(
        getCloudflareLogEndpoint({
          id: '1#2',
          accountId: 'acc ount',
          projectName: 'a?b'
        })
      ).toBe('https://dash.cloudflare.com/acc%20ount/pages/view/a%3Fb/1%232')
    })
  })
})
