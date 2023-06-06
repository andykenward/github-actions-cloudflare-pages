import type {Deployment} from '@cloudflare/types'
import {vi} from 'vitest'
import wrangler from 'wrangler'

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
