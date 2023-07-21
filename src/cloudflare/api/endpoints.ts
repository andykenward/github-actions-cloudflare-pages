import {useInputs} from '@/src/inputs.js'

const API_ENDPOINT = `https://api.cloudflare.com`

export const getCloudflareApiEndpoint = (path?: string): string => {
  const {cloudflareAccountId, cloudflareProjectName} = useInputs()

  const input: string = [
    `/client/v4/accounts/${cloudflareAccountId}/pages/projects/${cloudflareProjectName}`,
    path
  ]
    .filter(Boolean)
    .join('/')

  return new URL(input, API_ENDPOINT).toString()
}

export const getCloudflareLogEndpoint = (id: string): string => {
  const {cloudflareAccountId, cloudflareProjectName} = useInputs()

  return new URL(
    `${cloudflareAccountId}/pages/view/${cloudflareProjectName}/${id}`,
    `https://dash.cloudflare.com`
  ).toString()
}
