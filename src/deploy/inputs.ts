import type {InputOptions} from '@unlike/github-actions-core'

import {getInput} from '@unlike/github-actions-core'

import {checkWorkingDirectory} from '@/common/utils.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_WORKING_DIRECTORY
} from '@/input-keys'

const OPTIONS: InputOptions = {
  required: true
}

export interface Inputs {
  /** Cloudflare Account Id */
  cloudflareAccountId: string
  /**  Cloudflare Pages Project Name */
  cloudflareProjectName: string
  /** Directory of static files to upload */
  directory: string

  workingDirectory?: string
}

const getInputs = (): Inputs => {
  return {
    cloudflareAccountId: getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, OPTIONS),
    cloudflareProjectName: getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME, OPTIONS),
    directory: getInput(INPUT_KEY_DIRECTORY, OPTIONS),
    workingDirectory: checkWorkingDirectory(
      getInput(INPUT_KEY_WORKING_DIRECTORY, {required: false})
    )
  }
}

type UseInputs = ReturnType<typeof getInputs>

let _inputs: UseInputs

export const useInputs = (): UseInputs => {
  return process.env.NODE_ENV === 'test'
    ? getInputs()
    : _inputs ?? (_inputs = getInputs())
}
