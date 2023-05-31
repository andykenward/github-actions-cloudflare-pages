import {vi} from 'vitest'

import * as endpoints from '../endpoints'

export const getCloudflareApiEndpoint = vi
  .fn<never, ReturnType<typeof endpoints.getCloudflareApiEndpoint>>()
  .mockReturnValue(
    `https://api.cloudflare.com/client/v4/accounts/mock-account-id/pages/projects/mock-project-name`
  )
