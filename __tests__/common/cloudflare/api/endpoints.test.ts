import {describe, expect, test} from 'vitest'

import {
  cloudflareIdFromLogUrl,
  getCloudflareLogEndpoint
} from '@/common/cloudflare/api/endpoints.js'

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

  describe(cloudflareIdFromLogUrl, () => {
    const endpoint = {accountId: 'acc ount', projectName: 'a?b'}

    test('reads back the id of a log URL built for the project', () => {
      expect.assertions(1)

      expect(
        cloudflareIdFromLogUrl(
          getCloudflareLogEndpoint({...endpoint, id: '1#2'}),
          endpoint
        )
      ).toBe('1#2')
    })

    test.each([
      {url: 'https://github.com/o/r/actions/runs/1', reason: 'an Actions log'},
      {
        url: 'https://dash.cloudflare.com/acc%20ount/pages/view/other/1',
        reason: 'another project'
      },
      {
        url: 'https://dash.cloudflare.com/acc%20ount/pages/view/a%3Fb/',
        reason: 'no id'
      },
      {
        url: 'https://dash.cloudflare.com/acc%20ount/pages/view/a%3Fb/1/2',
        reason: 'a deeper path'
      }
    ])('reads no id from $reason', ({url}) => {
      expect.assertions(1)

      expect(cloudflareIdFromLogUrl(url, endpoint)).toBeUndefined()
    })
  })
})
