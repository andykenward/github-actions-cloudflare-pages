import {vi} from 'vitest'

import {getCloudflareProject as originalGetCloudflareProject} from '../get.js'

export const getCloudflareProject = vi
  .fn()
  .mockResolvedValue({production_branch: 'main'} satisfies Partial<
    Awaited<ReturnType<typeof originalGetCloudflareProject>>
  >)
