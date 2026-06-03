import type {InputOptions} from '@actions/core'

import {getInput} from '@actions/core'

import {checkWorkingDirectory} from '@/common/utils.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME,
  INPUT_KEY_DIRECTORY,
  INPUT_KEY_WORKING_DIRECTORY,
  INPUT_KEY_BRANCH
} from '@/input-keys'

const OPTIONS = {
  required: true
} as const satisfies InputOptions

interface Inputs {
  /** Cloudflare Account Id */
  cloudflareAccountId: string
  /**  Cloudflare Pages Project Name */
  cloudflareProjectName: string
  /** Directory of static files to upload */
  directory: string

  workingDirectory?: string
  /** Branch name override for Cloudflare Pages deployment */
  branch?: string
}

const getInputs = (): Inputs => {
  return {
    cloudflareAccountId: getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, OPTIONS),
    cloudflareProjectName: getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME, OPTIONS),
    directory: getInput(INPUT_KEY_DIRECTORY, OPTIONS),
    workingDirectory: checkWorkingDirectory(
      getInput(INPUT_KEY_WORKING_DIRECTORY, {required: false})
    ),
    branch: getInput(INPUT_KEY_BRANCH, {required: false}) || undefined
  }
}

type UseInputs = ReturnType<typeof getInputs>

let _inputs: UseInputs

export const useInputs = (): UseInputs => {
  return _inputs ?? (_inputs = getInputs())
}
