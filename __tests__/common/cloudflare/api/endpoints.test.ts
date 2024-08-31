import {describe, expect, test} from 'vitest'

import {
  getCloudflareApiEndpoint,
  getCloudflareLogEndpoint
} from '@/common/cloudflare/api/endpoints.js'

describe('endpoints', () => {
  describe('getCloudflareApiEndpoint', () => {
    test('returns correct url', () => {
      expect.assertions(1)

      const url = getCloudflareApiEndpoint({
        accountId: 'mock-cloudflare-account-id',
        projectName: 'mock-cloudflare-project-name'
      })

      expect(url).toBe(
        `https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name`
      )
    })

    test('appends path argument', () => {
      expect.assertions(2)

      const url = getCloudflareApiEndpoint({
        path: 'mock-deployment',
        accountId: 'mock-cloudflare-account-id',
        projectName: 'mock-cloudflare-project-name'
      })

      expect(url).toBe(
        `https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/mock-deployment`
      )

      const urlParams = getCloudflareApiEndpoint({
        path: `deployments/${123}?force=true`,
        accountId: 'mock-cloudflare-account-id',
        projectName: 'mock-cloudflare-project-name'
      })

      expect(urlParams).toMatchInlineSnapshot(
        '"https://api.cloudflare.com/client/v4/accounts/mock-cloudflare-account-id/pages/projects/mock-cloudflare-project-name/deployments/123?force=true"'
      )
    })
  })

  describe('getCloudflareLogEndpoint', () => {
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
