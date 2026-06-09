import {afterEach, beforeEach, vi} from 'vitest'

import {INPUT_KEY_COMMENT_DISABLE_WRANGLER_OUTPUT} from '@/input-keys'
import {stubTestEnvVars} from '@/tests/helpers/env.js'
import {stubInputEnv, stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

beforeEach(() => {
  stubTestEnvVars()
  stubRequiredInputEnv()
  stubInputEnv(INPUT_KEY_COMMENT_DISABLE_WRANGLER_OUTPUT, 'false')
})
afterEach(() => {
  vi.unstubAllEnvs()
})
