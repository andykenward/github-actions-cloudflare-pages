import {vi} from 'vitest'

export const getCloudflareApiEndpoint = vi
  .fn()
  .mockReturnValue(
    `https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name`
  )
