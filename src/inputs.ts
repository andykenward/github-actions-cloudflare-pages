import type {InputOptions} from '@unlike/github-actions-core'

import {getInput} from '@unlike/github-actions-core'

const INPUT_KEY_CLOUDFLARE_ACCOUNT_ID = 'cloudflare account id'
const INPUT_KEY_CLOUDFLARE_API_TOKEN = 'cloudflare api token'
const INPUT_KEY_CLOUDFLARE_PROJECT_NAME = 'cloudflare project name'
const INPUT_KEY_DIRECTORY = 'directory'
const INPUT_KEY_GITHUB_ENVIRONMENT = 'github environment'
const INPUT_KEY_GITHUB_TOKEN = 'github token'

export const INPUT_KEYS_REQUIRED = [
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_GITHUB_TOKEN
] as const

const OPTIONS: InputOptions = {
  required: true
}

interface Inputs {
  /** Cloudflare Account Id */
  cloudflareAccountId: string
  /** Cloudflare API token */
  cloudflareApiToken: string
  /**  Cloudflare Pages Project Name */
  cloudflareProjectName: string
  /** Directory of static files to upload */
  directory: string
  /** GitHub API Token */
  gitHubApiToken: string
  /** GitHub Environment to use for deployment */
  gitHubEnvironment: string
}

const getInputs = (): Inputs => {
  return {
    cloudflareAccountId: getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, OPTIONS),
    cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, OPTIONS),
    cloudflareProjectName: getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME, OPTIONS),
    directory: getInput(INPUT_KEY_DIRECTORY, OPTIONS),
    gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, OPTIONS),
    gitHubEnvironment: getInput(INPUT_KEY_GITHUB_ENVIRONMENT, OPTIONS)
  }
}

type UseInputs = ReturnType<typeof getInputs>

let _inputs: UseInputs

export const useInputs = (): UseInputs => {
  return _inputs ?? (_inputs = getInputs())
}
