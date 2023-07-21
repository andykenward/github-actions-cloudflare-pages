import {describe, expect, test} from 'vitest'

import {
  getCloudflareApiEndpoint,
  getCloudflareLogEndpoint
} from '@/src/cloudflare/api/endpoints.js'

describe('endpoints', () => {
  describe('getCloudflareApiEndpoint', () => {
    test('returns correct url', () => {
      const url = getCloudflareApiEndpoint()

      expect(url).toBe(
        `https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name`
      )
    })

    test('appends path argument', () => {
      const url = getCloudflareApiEndpoint('mock-deployment')

      expect(url).toBe(
        `https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/mock-deployment`
      )

      const urlParams = getCloudflareApiEndpoint(
        `deployments/${123}?force=true`
      )

      expect(urlParams).toMatchInlineSnapshot(
        '"https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/deployments/123?force=true"'
      )
    })
  })

  describe('getCloudflareLogEndpoint', () => {
    test('returns correct url', () => {
      const url = getCloudflareLogEndpoint('123')

      expect(url).toMatchInlineSnapshot(
        '"https://dash.cloudflare.com/mock-cloudflare-account-id/pages/view/mock-cloudflare-project-name/123"'
      )
      expect(url).toContain('123')
    })
  })
})
