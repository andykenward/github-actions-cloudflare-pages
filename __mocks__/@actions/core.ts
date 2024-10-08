import * as core from '@actions/core'
import {vi} from 'vitest'

export const getInput = vi.fn<typeof core.getInput>((name: string, options) =>
  core.getInput(name, options)
)

export const setOutput = vi.fn()

export const error = vi.fn()
export const notice = vi.fn()

export const debug = vi.fn()
export const isDebug = vi.fn().mockReturnValue(false)
export const setFailed = vi.fn()
export const info = vi.fn()
export const warning = vi.fn()

export const summary = core.summary
summary.addTable = vi.fn().mockReturnValue(summary)
summary.addHeading = vi.fn().mockReturnValue(summary)
summary.addBreak = vi.fn().mockReturnValue(summary)
summary.addRaw = vi.fn().mockReturnValue(summary)
summary.write = vi.fn()
