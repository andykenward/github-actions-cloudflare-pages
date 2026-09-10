import * as Effect from 'effect/Effect'

import {GitHubContext} from '@/common/github/context.js'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {CloudflareApi} from '../api/client.js'

export const getCloudflareDeploymentAlias = (
  deployment: PagesDeployment
): string => {
  return deployment.aliases?.at(0) ?? deployment.url
}

/** The deployment with `deploymentId`. */
export const getCloudflareDeployment = Effect.fn('getCloudflareDeployment')(
  function* ({
    accountId,
    projectName,
    deploymentId
  }: CloudflareApiEndpoint & {deploymentId: string}) {
    const cloudflare = yield* CloudflareApi

    return yield* cloudflare.result(client =>
      client.GET(
        '/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}',
        {
          params: {
            path: {
              account_id: accountId,
              project_name: projectName,
              deployment_id: deploymentId
            }
          }
        }
      )
    )
  }
)

/**
 * Find the latest deployment by commitHash — the fallback when wrangler
 * reports no deployment id. On a re-run for the same commit this can match the
 * previous deployment until Cloudflare lists the new one.
 *
 * Succeeds with `undefined` rather than failing when nothing matches:
 * immediately after wrangler returns, Cloudflare has usually not registered
 * the deployment yet, and that race is an expected, retryable state rather
 * than a failure.
 */
export const findCloudflareLatestDeployment = Effect.fn(
  'findCloudflareLatestDeployment'
)(function* ({accountId, projectName}: CloudflareApiEndpoint) {
  const {sha: commitHash} = yield* GitHubContext
  const cloudflare = yield* CloudflareApi

  const deployments = yield* cloudflare.result(client =>
    client.GET(
      '/accounts/{account_id}/pages/projects/{project_name}/deployments',
      {params: {path: {account_id: accountId, project_name: projectName}}}
    )
  )

  return deployments.find(
    deployment =>
      deployment.deployment_trigger.metadata.commit_hash === commitHash
  )
})
