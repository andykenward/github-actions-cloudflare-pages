import {getInput} from '@actions/core'

import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_COMMENT_DISABLE_WRANGLER_OUTPUT,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_PR_NUMBER,
  INPUT_KEY_GITHUB_TOKEN,
  INPUT_KEY_WRANGLER_VERSION
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
  /** Disable Wrangler output in GitHub comment. */
  commentDisableWranglerOutput: boolean
}

const getInputs = (): Inputs => {
  const commentDisableWranglerOutputInput = getInput(
    INPUT_KEY_COMMENT_DISABLE_WRANGLER_OUTPUT,
    {required: false}
  )
  const commentDisableWranglerOutput =
    commentDisableWranglerOutputInput.toLowerCase() === 'true'

  return {
    cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, {
      required: true
    }),
    gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, {required: true}),
    gitHubEnvironment:
      getInput(INPUT_KEY_GITHUB_ENVIRONMENT, {required: false}) || undefined,
    prNumber: getInput(INPUT_KEY_PR_NUMBER, {required: false}) || undefined,
    wranglerVersion: getInput(INPUT_KEY_WRANGLER_VERSION) || '4.86.0',
    commentDisableWranglerOutput
  }
}

type UseCommonInputs = ReturnType<typeof getInputs>

let _inputs: UseCommonInputs

export const useCommonInputs = (): UseCommonInputs => {
  return _inputs ?? (_inputs = getInputs())
}
