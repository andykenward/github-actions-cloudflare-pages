import type {CloudflareApiEndpoint} from '@/common/cloudflare/api/endpoints.js'
import type {CreateDeploymentStatusInput} from '@/gql/graphql.js'

import {
  cloudflareIdFromLogUrl,
  getCloudflareLogEndpoint
} from '@/common/cloudflare/api/endpoints.js'

/**
 * How a status (and the deployment itself) names its Cloudflare deployment.
 * The delete action reads the id back from it, so keep the wording.
 */
const DESCRIPTION_PREFIX = 'Cloudflare Pages Deployment: '

const cloudflareDescription = (id: string): string =>
  `${DESCRIPTION_PREFIX}${id}`

/** The fields of a status that record which Cloudflare deployment it is. */
export type CloudflareStatusFields = {
  environmentUrl?: string | undefined
  logUrl?: string | undefined
  description?: string | undefined
}

/**
 * The status fields for a known Cloudflare deployment: its URL, the dashboard
 * as the log URL, and its id in the description.
 */
export const cloudflareStatusFields = ({
  url,
  ...cloudflare
}: {id: string; url?: string | undefined} & CloudflareApiEndpoint) => ({
  environmentUrl: url,
  logUrl: getCloudflareLogEndpoint(cloudflare),
  description: cloudflareDescription(cloudflare.id)
})

/**
 * The Cloudflare deployment id a status recorded: from its description, else
 * from a dashboard log URL. `undefined` when it names none — a run that
 * failed or was cancelled before Cloudflare had a deployment.
 */
export const cloudflareIdFromStatus = (
  {
    description,
    logUrl
  }: {
    description?: string | null | undefined
    logUrl?: string | null | undefined
  },
  endpoint: CloudflareApiEndpoint
): string | undefined => {
  const id = description?.startsWith(DESCRIPTION_PREFIX)
    ? description.slice(DESCRIPTION_PREFIX.length).trim()
    : ''
  if (id.length > 0) {
    return id
  }
  return logUrl ? cloudflareIdFromLogUrl(logUrl, endpoint) : undefined
}

/**
 * A status for a GitHub Deployment. `autoInactive` is off so one deployment's
 * status never changes another's. Fields left `undefined` are dropped from
 * the request.
 */
export const deploymentStatusInput = ({
  deploymentId,
  environment,
  state,
  environmentUrl,
  logUrl,
  description
}: {
  deploymentId: string
  environment: string
  state: CreateDeploymentStatusInput['state']
} & CloudflareStatusFields): CreateDeploymentStatusInput => ({
  deploymentId,
  environment,
  environmentUrl,
  logUrl,
  description,
  state,
  autoInactive: false
})
