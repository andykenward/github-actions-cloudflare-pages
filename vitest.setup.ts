import {fetch} from 'undici'
import {afterEach, beforeEach, vi} from 'vitest'

import {stubTestEnvVars} from '@/tests/helpers/env.js'
import {stubRequiredInputEnv} from '@/tests/helpers/inputs.js'

// undici v8 uses a different global-dispatcher symbol than Node.js 24's bundled
// undici, so setGlobalDispatcher(mockAgent) in tests no longer intercepts the
// runtime's native fetch(). Swapping globalThis.fetch for undici's own fetch
// routes all test HTTP calls through the same dispatcher the mocks register on.
globalThis.fetch = fetch as typeof globalThis.fetch

beforeEach(() => {
  stubTestEnvVars()
  stubRequiredInputEnv()
})
afterEach(() => {
  vi.unstubAllEnvs()
})
