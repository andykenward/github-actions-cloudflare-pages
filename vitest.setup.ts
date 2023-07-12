import {afterEach, beforeEach, vi} from 'vitest'

import {stubTestEnvVars} from './__tests__/helpers/index.js'

beforeEach(() => {
  stubTestEnvVars()
})
afterEach(() => {
  vi.unstubAllEnvs()
})
