import {afterEach, beforeEach, vi} from 'vitest'

import {stubTestEnvVars} from '@/tests/helpers/env.js'
import {stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

beforeEach(() => {
  stubTestEnvVars()
  stubRequiredInputEnv()
})
afterEach(() => {
  vi.unstubAllEnvs()
})
