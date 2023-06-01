import {getInput} from '@actions/core'

const API_ENDPOINT = `https://api.cloudflare.com`
/** Cloudflare Account Id */
export const ACTION_INPUT_ACCOUNT_ID = 'accountId'
/** Cloudflare Project Name */
export const ACTION_INPUT_PROJECT_NAME = 'projectName'

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
