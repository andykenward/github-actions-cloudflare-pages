import {vi} from 'vitest'

import * as utils from '../utils.js'

export * from '../utils.js'

export const execAsync = vi.fn()
export const checkWorkingDirectory = (
  directory = '.'
): ReturnType<typeof utils.checkWorkingDirectory> => directory
