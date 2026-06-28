import {describe, expect, test} from 'vitest'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'

describe('endpoints', () => {
  describe(getCloudflareLogEndpoint, () => {
    test('returns correct url', () => {
      expect.assertions(2)

      const url = getCloudflareLogEndpoint({
        id: '123',
        accountId: 'mock-cloudflare-account-id',
        projectName: 'mock-cloudflare-project-name'
      })

      expect(url).toMatchInlineSnapshot(
        '"https://dash.cloudflare.com/mock-cloudflare-account-id/pages/view/mock-cloudflare-project-name/123"'
      )
      expect(url).toContain('123')
    })
  })
})
