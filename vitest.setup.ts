import {afterEach, beforeEach, vi} from 'vitest'

import {
  stubRequiredInputEnv,
  stubTestEnvVars
} from './__tests__/helpers/index.js'

beforeEach(() => {
  stubTestEnvVars()
  stubRequiredInputEnv()
})
afterEach(() => {
  vi.unstubAllEnvs()
})
