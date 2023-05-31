import {getInput} from '@actions/core'

const API_ENDPOINT = `https://api.cloudflare.com/client/v4/accounts/`
/** Cloudflare Account Id */
export const ACTION_INPUT_ACCOUNT_ID = 'accountId'
/** Cloudflare Project Name */
export const ACTION_INPUT_PROJECT_NAME = 'projectName'

export const getCloudflareApiEndpoint =
  (): `${typeof API_ENDPOINT}${string}/pages/projects/${string}` => {
    const accountIdentifier = getInput(ACTION_INPUT_ACCOUNT_ID, {
      required: true
    })
    const projectName = getInput(ACTION_INPUT_PROJECT_NAME, {required: true})

    return `${API_ENDPOINT}${accountIdentifier}/pages/projects/${projectName}`
  }
