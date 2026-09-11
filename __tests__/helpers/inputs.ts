import {vi} from 'vitest'

import {INPUT_KEYS_KEEP_LATEST, INPUT_KEYS_REQUIRED} from '@/input-keys'

const INPUT_KEY = `INPUT_`

/** For `core.getInput()` */
export const stubInputEnv = (input: string, value?: string): void => {
  const setValue = value ?? `mock-${input.replaceAll(' ', '-')}`.toLowerCase()
  vi.stubEnv(
    `${INPUT_KEY}${input.replaceAll(' ', '_')}`.toUpperCase(),
    setValue
  )
}

/**
 * Inputs whose mock value cannot be the generic `mock-<name>` string because
 * they are parsed as something other than a free-form string.
 */
const TYPED_INPUT_VALUES: Partial<Record<string, string>> = {
  [INPUT_KEYS_KEEP_LATEST]: '0'
}

/**
 * Set all required GitHub Action inputs to mock values.
 */
export const stubRequiredInputEnv = () => {
  for (const input of INPUT_KEYS_REQUIRED) {
    stubInputEnv(input, TYPED_INPUT_VALUES[input])
  }
}
