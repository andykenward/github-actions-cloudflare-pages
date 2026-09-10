import * as Effect from 'effect/Effect'

import {GitHubContext} from '@/common/github/context.js'

import type {CloudflareApiEndpoint} from '../api/endpoints.js'
import type {PagesDeployment} from '../types.js'

import {CloudflareApi, CloudflareApiError} from '../api/client.js'
import {unwrap} from '../api/fetch-result.js'

export const getCloudflareDeploymentAlias = (
  deployment: PagesDeployment
): string => {
  return deployment.aliases?.at(0) ?? deployment.url
}

/**
 * Find the latest deployment by commitHash.
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

  const deployments = yield* Effect.tryPromise({
    try: async () =>
      unwrap(
        await cloudflare.GET(
          '/accounts/{account_id}/pages/projects/{project_name}/deployments',
          {params: {path: {account_id: accountId, project_name: projectName}}}
        )
      ),
    catch: CloudflareApiError.from
  })

  return deployments.find(
    deployment =>
      deployment.deployment_trigger.metadata.commit_hash === commitHash
  )
})
