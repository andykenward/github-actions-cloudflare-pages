import {vi} from 'vitest'

import type * as utils from '../utils.js'

export * from '../utils.js'

export const execFileAsync = vi.fn<typeof utils.execFileAsync>()
