import {getInput} from '@unlike/github-actions-core'

import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_PROJECT_NAME
} from '../../constants.js'

const API_ENDPOINT = `https://api.cloudflare.com`

export const getCloudflareApiEndpoint = (path?: string): string => {
  const accountIdentifier = getInput(ACTION_INPUT_ACCOUNT_ID, {
    required: true
  })
  const projectName = getInput(ACTION_INPUT_PROJECT_NAME, {required: true})

  const input: string = [
    `/client/v4/accounts/${accountIdentifier}/pages/projects/${projectName}`,
    path
  ]
    .filter(Boolean)
    .join('/')

  return new URL(input, API_ENDPOINT).toString()
}
