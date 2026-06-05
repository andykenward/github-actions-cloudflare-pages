import {useContext} from '@/common/github/context.js'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {getCloudflareClient} from '../api/client.js'

export const getCloudflareDeploymentAlias = (
  deployment: PagesDeployment
): string => {
  return deployment.aliases?.at(0) ?? deployment.url ?? ''
}

/**
 * Get the latest deployment by commitHash.
 */
export const getCloudflareLatestDeployment = async ({
  accountId,
  projectName
}: CloudflareApiEndpoint): Promise<PagesDeployment> => {
  const {sha: commitHash} = useContext()
  const client = getCloudflareClient()

  const deployments: PagesDeployment[] = []
  for await (const deployment of client.pages.projects.deployments.list(
    accountId,
    {project_name: projectName}
  )) {
    deployments.push(deployment)
  }

  const deployment = deployments.find(
    d => d.deployment_trigger?.metadata?.commit_hash === commitHash
  )

  if (deployment === undefined) {
    throw new Error(
      `Cloudflare: could not find deployment with commitHash: ${commitHash}`
    )
  }

  return deployment
}
