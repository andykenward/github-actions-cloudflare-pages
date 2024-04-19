const API_ENDPOINT = `https://api.cloudflare.com`

export type CloudflareApiEndpoint = {
  accountId: string
  projectName: string
}

export const getCloudflareApiEndpoint = ({
  path,
  accountId,
  projectName
}: {
  path?: string
} & CloudflareApiEndpoint): string => {
  const input: string = [
    `/client/v4/accounts/${accountId}/pages/projects/${projectName}`,
    path
  ]
    .filter(Boolean)
    .join('/')

  return new URL(input, API_ENDPOINT).toString()
}

export const getCloudflareLogEndpoint = ({
  id,
  accountId,
  projectName
}: {
  id: string
} & CloudflareApiEndpoint): string => {
  return new URL(
    `${accountId}/pages/view/${projectName}/${id}`,
    `https://dash.cloudflare.com`
  ).toString()
}
