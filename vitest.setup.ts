import {afterEach, beforeEach} from 'vitest'

import {setTestEnvVars} from './__tests__/helpers/index.js'

/** So we can reset process.env between tests */
const env: NodeJS.ProcessEnv = process.env

beforeEach(() => {
  /**
   * Reset process.env as GitHub Action inputs are on process.env.
   * This is used by `core.getInput()`.
   */
  process.env = {...env}
  setTestEnvVars()
})
afterEach(() => {
  /**
   * Reset process.env as GitHub Action inputs are on process.env.
   * This is used by `core.getInput()`.
   */
  process.env = {...env}
})
