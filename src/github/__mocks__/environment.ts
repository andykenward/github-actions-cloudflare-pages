import {vi} from 'vitest'

import type {Environment} from '../environment.js'

export const createEnvironment = vi.fn().mockResolvedValue({
  name: 'unlike-dev (Preview)',
  id: 'EN_kwDOJn0nrM5D_l8n'
} satisfies Environment)
