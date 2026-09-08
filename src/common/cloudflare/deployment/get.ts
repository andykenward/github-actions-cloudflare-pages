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
 * Find the latest deployment by commitHash.
 *
 * Returns `undefined` rather than throwing when nothing matches: immediately
 * after wrangler returns, Cloudflare has usually not registered the deployment
 * yet, and that race is an expected, retryable state rather than a failure.
 */
export const findCloudflareLatestDeployment = async ({
  accountId,
  projectName
}: CloudflareApiEndpoint): Promise<PagesDeployment | undefined> => {
  const {sha: commitHash} = useContext()

  const deployments = unwrap(
    await cloudflareClient.GET(
      '/accounts/{account_id}/pages/projects/{project_name}/deployments',
      {params: {path: {account_id: accountId, project_name: projectName}}}
    )
  )

  return deployments.find(
    deployment =>
      deployment.deployment_trigger.metadata.commit_hash === commitHash
  )
}
