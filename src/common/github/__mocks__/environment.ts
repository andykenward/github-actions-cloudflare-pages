import {vi} from 'vitest'

import type {Environment} from '../environment.js'

export const createEnvironment = vi.fn().mockResolvedValue({
  name: 'unlike-dev (Preview)',
  id: 'EN_kwDOJn0nrM5D_l8n',
  refId: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='
} satisfies Environment)

export const checkEnvironment = vi.fn().mockResolvedValue({
  name: 'unlike-dev (Preview)',
  id: 'EN_kwDOJn0nrM5D_l8n',
  refId: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='
} satisfies Environment)
