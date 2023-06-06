import core from '@actions/core'
import {vi} from 'vitest'

export const getInput = vi.fn<
  Parameters<typeof core.getInput>,
  ReturnType<typeof core.getInput>
>((name: string) => `mock-${name}`)

export const setOutput = vi.fn()
