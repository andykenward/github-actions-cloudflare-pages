import {getInput} from '@unlike/github-actions-core'

import {
  INPUT_KEY_CLOUDFLARE_API_TOKEN,
  INPUT_KEY_GITHUB_ENVIRONMENT,
  INPUT_KEY_GITHUB_TOKEN
} from '@/input-keys'

type Inputs = {
  /** Cloudflare API token */
  cloudflareApiToken: string
  /** GitHub API Token */
  gitHubApiToken: string
  /** GitHub Environment to use for deployment */
  gitHubEnvironment?: string
}

const getInputs = (): Inputs => {
  return {
    cloudflareApiToken: getInput(INPUT_KEY_CLOUDFLARE_API_TOKEN, {
      required: true
    }),
    gitHubApiToken: getInput(INPUT_KEY_GITHUB_TOKEN, {required: true}),
    gitHubEnvironment:
      getInput(INPUT_KEY_GITHUB_ENVIRONMENT, {required: false}) || undefined
  }
}

type UseCommonInputs = ReturnType<typeof getInputs>

let _inputs: UseCommonInputs

export const useCommonInputs = (): UseCommonInputs => {
  return process.env.NODE_ENV === 'test'
    ? getInputs()
    : _inputs ?? (_inputs = getInputs())
}
