import {vi} from 'vitest'

import type * as utils from '../utils.js'

export * from '../utils.js'

export const execAsync = vi.fn<typeof utils.execAsync>()
export const execFileAsync = vi.fn<typeof utils.execFileAsync>()
export const sleep = vi.fn<typeof utils.sleep>()
export const checkWorkingDirectory = (
  directory = '.'
): ReturnType<typeof utils.checkWorkingDirectory> => directory
