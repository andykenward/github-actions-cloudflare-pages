export type CloudflareApiEndpoint = {
  accountId: string
  projectName: string
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
