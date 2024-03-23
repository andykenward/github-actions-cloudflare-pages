import type {InputOptions} from '@unlike/github-actions-core'

import {getInput} from '@unlike/github-actions-core'

import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_GITHUB_TOKEN,
  INPUT_KEY_WORKING_DIRECTORY
} from '../input-keys.js'
import {checkWorkingDirectory} from './utils.js'

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
  workingDirectory?: string
}

const getInputs = (): Inputs => {
  return {
    cloudflareAccountId: getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, OPTIONS),
    cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, OPTIONS),
    cloudflareProjectName: getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME, OPTIONS),
    directory: getInput(INPUT_KEY_DIRECTORY, OPTIONS),
    gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, OPTIONS),
    gitHubEnvironment: getInput(INPUT_KEY_GITHUB_ENVIRONMENT, OPTIONS),
    workingDirectory: checkWorkingDirectory(
      getInput(INPUT_KEY_WORKING_DIRECTORY, {required: false})
    )
  }
}

type UseInputs = ReturnType<typeof getInputs>

let _inputs: UseInputs

export const useInputs = (): UseInputs => {
  return _inputs ?? (_inputs = getInputs())
}
