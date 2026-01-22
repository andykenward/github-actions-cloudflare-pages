import {getInput} from '@actions/core'

import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_GITHUB_ENVIRONMENT,
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
  /** Wrangler version to use. */
  wranglerVersion: string
}

const getInputs = (): Inputs => {
  return {
    cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, {
      required: true
    }),
    gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, {required: true}),
    gitHubEnvironment:
      getInput(INPUT_KEY_GITHUB_ENVIRONMENT, {required: false}) || undefined,
    wranglerVersion: getInput(INPUT_KEY_WRANGLER_VERSION) || '4.59.1'
  }
}

type UseCommonInputs = ReturnType<typeof getInputs>

let _inputs: UseCommonInputs

export const useCommonInputs = (): UseCommonInputs => {
  return _inputs ?? (_inputs = getInputs())
}
