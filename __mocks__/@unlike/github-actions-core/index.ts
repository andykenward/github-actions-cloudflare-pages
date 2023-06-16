import * as core from '@unlike/github-actions-core'
import {vi} from 'vitest'

export const getInput = vi.fn<
  Parameters<typeof core.getInput>,
  ReturnType<typeof core.getInput>
>((name: string, options) => core.getInput(name, options))

export const setOutput = vi.fn()

export const error = vi.fn()
