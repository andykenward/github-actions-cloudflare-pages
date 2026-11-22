import {url} from '@/common/html.js'

export type CloudflareApiEndpoint = {
  accountId: string
  projectName: string
}

/** The project's page in the Cloudflare dashboard; deployments sit below it. */
const getCloudflareProjectEndpoint = ({
  accountId,
  projectName
}: CloudflareApiEndpoint): string =>
  url('https://dash.cloudflare.com', accountId, 'pages', 'view', projectName)

/** The deployment's page in the Cloudflare dashboard, with its build log. */
export const getCloudflareLogEndpoint = ({
  id,
  ...endpoint
}: {
  id: string
} & CloudflareApiEndpoint): string =>
  url(getCloudflareProjectEndpoint(endpoint), id)

/**
 * The deployment id in a log URL `getCloudflareLogEndpoint` built for this
 * project, or `undefined` for any other URL (such as an Actions run log).
 */
export const cloudflareIdFromLogUrl = (
  logUrl: string,
  endpoint: CloudflareApiEndpoint
): string | undefined => {
  const prefix = `${getCloudflareProjectEndpoint(endpoint)}/`
  const id = logUrl.startsWith(prefix)
    ? decodeURIComponent(logUrl.slice(prefix.length))
    : ''
  return id.length > 0 && !id.includes('/') ? id : undefined
}
