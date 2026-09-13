import type {CreateDeploymentStatusInput} from '@/gql/graphql.js'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'

/**
 * The status both actions record on a GitHub Deployment: its Cloudflare URL
 * as the environment URL and the dashboard as the log URL. `autoInactive`
 * is off so one deployment's status never changes another's.
 */
export const deploymentStatusInput = ({
  deploymentId,
  environment,
  url,
  cloudflare,
  state
}: {
  deploymentId: string
  environment: string
  url: string
  cloudflare: Parameters<typeof getCloudflareLogEndpoint>[0]
  state: CreateDeploymentStatusInput['state']
}): CreateDeploymentStatusInput => ({
  deploymentId,
  environment,
  environmentUrl: url,
  logUrl: getCloudflareLogEndpoint(cloudflare),
  state,
  autoInactive: false
})
