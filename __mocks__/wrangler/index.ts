import type {Deployment} from '@cloudflare/types'
import type wrangler from 'wrangler'

import {vi} from 'vitest'

export default {
  unstable_pages: {
    deploy: vi
      .fn<
        Parameters<typeof wrangler.unstable_pages.deploy>,
        ReturnType<typeof wrangler.unstable_pages.deploy>
      >()
      .mockResolvedValue({
        id: 'deploy-id'
      } as Deployment)
  }
}
