import {getInput} from '@actions/core'

import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME
} from '@/input-keys'

import type {getGitHubDeployments} from './get.js'
import type {
  PayloadGithubDeployment,
  PayloadGithubDeploymentV2
} from './types.js'

export type Payload = Awaited<
  ReturnType<typeof getGitHubDeployments>
>[0]['payload']

function isObject(obj: unknown): obj is {[key: string]: unknown} {
  return typeof obj === 'object' && obj !== null
}

const isPayload = (payload: Payload): payload is PayloadGithubDeployment => {
  const parsedPayload =
    typeof payload === 'string' ? JSON.parse(payload) : payload

  if (!isObject(parsedPayload)) return false

  const requiredKeys: Array<keyof PayloadGithubDeployment> = [
    'cloudflareId',
    'url'
  ]

  return requiredKeys.every(key => key in parsedPayload)
}

const isPayloadV2 = (
  payload: Payload
): payload is PayloadGithubDeploymentV2 => {
  const parsedPayload =
    typeof payload === 'string' ? JSON.parse(payload) : payload

  if (!isObject(parsedPayload)) return false

  const requiredKeys: Array<keyof PayloadGithubDeploymentV2> = [
    'url',
    'cloudflare'
  ]

  if (requiredKeys.every(key => key in parsedPayload)) {
    const cloudflare = parsedPayload.cloudflare
    if (!isObject(cloudflare)) return false

    const requiredKeys: Array<keyof PayloadGithubDeploymentV2['cloudflare']> = [
      'id',
      'accountId',
      'projectName'
    ]

    return requiredKeys.every(key => key in cloudflare)
  }

  return false
}

export const getPayload = (payload: Payload): PayloadGithubDeploymentV2 => {
  if (isPayloadV2(payload)) {
    return payload
  }

  if (isPayload(payload)) {
    /**
     * To support old payloads we need to get the Cloudflare Account Id and Cloudflare Project Name.
     */
    const accountId = getInput(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID, {
      required: true
    })
    const projectName = getInput(INPUT_KEY_CLOUDFLARE_PROJECT_NAME, {
      required: true
    })

    const {cloudflareId, ...others} = payload

    return {
      cloudflare: {
        id: cloudflareId,
        accountId,
        projectName
      },
      ...others
    }
  }

  throw new Error('Payload is not valid')
}
