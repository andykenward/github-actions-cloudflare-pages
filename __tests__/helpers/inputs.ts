import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_API_TOKEN,
  ACTION_INPUT_DIRECTORY,
  ACTION_INPUT_GITHUB_ENVIRONMENT,
  ACTION_INPUT_GITHUB_TOKEN,
  ACTION_INPUT_PROJECT_NAME
} from '@/src/constants.js'

const INPUT_KEY = `INPUT_`

export const REQUIRED_INPUTS = [
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_PROJECT_NAME,
  ACTION_INPUT_DIRECTORY,
  ACTION_INPUT_API_TOKEN,
  ACTION_INPUT_GITHUB_TOKEN,
  ACTION_INPUT_GITHUB_ENVIRONMENT
] as const

/** For `core.getInput()` */
export const setInputEnv = (input: string, value: string): void => {
  process.env[`${INPUT_KEY}${input.replaceAll(' ', '_')}`.toUpperCase()] = value
}

export const unsetInputEnv = (input: string): void => {
  delete process.env[`${INPUT_KEY}${input}`.toUpperCase()]
}

/**
 * Set all required GitHub Action inputs to mock values.
 */
export const setRequiredInputEnv = () => {
  for (const input of REQUIRED_INPUTS) {
    const value = `mock-${input.replaceAll(' ', '-')}`
    setInputEnv(input, value)
  }
}
