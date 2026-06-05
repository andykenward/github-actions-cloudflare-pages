import {useContext} from '@/common/github/context.js'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {cloudflareClient} from '../api/client.js'
import {unwrap} from '../api/fetch-result.js'

export const getCloudflareDeploymentAlias = (
  deployment: PagesDeployment
): string => {
  return deployment.aliases?.at(0) ?? deployment.url
}

/**
 * Get the latest deployment by commitHash.
 */
export const getCloudflareLatestDeployment = async ({
  accountId,
  projectName
}: CloudflareApiEndpoint): Promise<PagesDeployment> => {
  const {sha: commitHash} = useContext()

  const deployments = unwrap(
    await cloudflareClient.GET(
      '/accounts/{account_id}/pages/projects/{project_name}/deployments',
      {params: {path: {account_id: accountId, project_name: projectName}}}
    )
  )

  const deployment = deployments.find(
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
