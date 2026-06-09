import {getInput} from '@actions/core'

import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_PR_NUMBER,
  INPUT_KEY_GITHUB_TOKEN,
  INPUT_KEY_WRANGLER_VERSION,
  INPUT_KEY_COMMENT_MODE,
  INPUT_KEY_HIDE_WRANGLER_OUTPUT
} from '@/input-keys'

type Inputs = {
  /** Cloudflare API token */
  cloudflareApiToken: string
  /** GitHub API Token */
  gitHubApiToken: string
  /** GitHub Environment to use for deployment */
  gitHubEnvironment?: string
  /** Pull request number to use for comment creation. */
  prNumber?: string
  /** Wrangler version to use. */
  wranglerVersion: string
  /** Comment mode: 'new' or 'update' */
  commentMode: 'new' | 'update'
  /** Whether to hide Wrangler output in PR comments */
  hideWranglerOutput: boolean
}

const getInputs = (): Inputs => {
  const commentMode =
    getInput(INPUT_KEY_COMMENT_MODE, {required: false}) || 'new'
  const hideWranglerOutputInput =
    getInput(INPUT_KEY_HIDE_WRANGLER_OUTPUT, {required: false}) || 'false'

  return {
    cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, {
      required: true
    }),
    gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, {required: true}),
    gitHubEnvironment:
      getInput(INPUT_KEY_GITHUB_ENVIRONMENT, {required: false}) || undefined,
    prNumber: getInput(INPUT_KEY_PR_NUMBER, {required: false}) || undefined,
    wranglerVersion: getInput(INPUT_KEY_WRANGLER_VERSION) || '4.86.0',
    commentMode: commentMode === 'update' ? 'update' : 'new',
    hideWranglerOutput: hideWranglerOutputInput.toLowerCase() === 'true'
  }
}

type UseCommonInputs = ReturnType<typeof getInputs>

let _inputs: UseCommonInputs

export const useCommonInputs = (): UseCommonInputs => {
  return _inputs ?? (_inputs = getInputs())
}
