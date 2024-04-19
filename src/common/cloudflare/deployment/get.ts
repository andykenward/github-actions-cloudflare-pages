import {useContext} from '@/common/github/context.js'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {getCloudflareApiEndpoint} from '../api/endpoints.js'
import {fetchResult} from '../api/fetch-result.js'

export const getCloudflareDeploymentAlias = (
  deployment: PagesDeployment
): string => {
  return deployment.aliases && deployment.aliases.length > 0
    ? deployment.aliases[0]
    : deployment.url
}

/**
 * Get the latest deployment by commitHash.
 */
export const getCloudflareLatestDeployment = async ({
  accountId,
  projectName
}: CloudflareApiEndpoint): Promise<PagesDeployment> => {
  const {sha: commitHash} = useContext()

  const deployments = await fetchResult<Array<PagesDeployment>>(
    getCloudflareApiEndpoint({path: 'deployments', accountId, projectName})
  )

  const deployment = deployments?.find(
    deployment =>
      deployment.deployment_trigger.metadata.commit_hash === commitHash
  )

  if (deployment === undefined) {
    throw new Error(
      `Cloudflare: could not find deployment with commitHash: ${commitHash}`
    )
  }

  return deployment
}
