import {vi} from 'vitest'

import {INPUT_KEYS_REQUIRED} from '@/src/inputs.js'

const INPUT_KEY = `INPUT_`

/** For `core.getInput()` */
const stubInputEnv = (input: string, value?: string): void => {
  const setValue = value ?? `mock-${input.replaceAll(' ', '-')}`.toLowerCase()
  vi.stubEnv(
    `${INPUT_KEY}${input.replaceAll(' ', '_')}`.toUpperCase(),
    setValue
  )
}

/**
 * Set all required GitHub Action inputs to mock values.
 */
export const stubRequiredInputEnv = () => {
  for (const input of INPUT_KEYS_REQUIRED) {
    stubInputEnv(input)
  }
}
