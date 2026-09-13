import {url} from '@/common/html.js'

export type CloudflareApiEndpoint = {
  accountId: string
  projectName: string
}

/** The deployment's page in the Cloudflare dashboard, with its build log. */
export const getCloudflareLogEndpoint = ({
  id,
  accountId,
  projectName
}: {
  id: string
} & CloudflareApiEndpoint): string =>
  url(
    'https://dash.cloudflare.com',
    accountId,
    'pages',
    'view',
    projectName,
    id
  )
