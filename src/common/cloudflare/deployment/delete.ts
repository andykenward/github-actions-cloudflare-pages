import {info, warning} from '@actions/core'
import * as Effect from 'effect/Effect'

import {CloudflareApi} from '../api/client.js'

/**
 * Cloudflare's "deployment does not exist" code. Treated as success: the
 * deployment may have been deleted manually already.
 *
 * ```json
 * {
 *   "code": 8000009,
 *   "message": "The deployment ID you have specified does not exist. Update the deployment ID and try again. "
 * }
 * ```
 */
const DEPLOYMENT_NOT_FOUND_CODE = 8_000_009

/**
 * Deletes the deployment. Succeeds once it is gone — including when Cloudflare
 * says it never existed — and fails with `CloudflareApiError` otherwise; the
 * caller decides what a failed delete means.
 */
export const deleteCloudflareDeployment = Effect.fn(
  'deleteCloudflareDeployment'
)(
  function* ({
    id,
    accountId,
    projectName
  }: {
    /** The Cloudflare deployment id. */
    id: string
    accountId: string
    projectName: string
  }) {
    const cloudflare = yield* CloudflareApi

    yield* cloudflare.success((client, signal) =>
      client.DELETE(
        '/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}',
        {
          params: {
            path: {
              account_id: accountId,
              project_name: projectName,
              deployment_id: id
            },
            query: {force: true}
          },
          signal
        }
      )
    )

    info(`Cloudflare Deployment Deleted: ${id}`)
  },
  (effect, {id}) =>
    Effect.catch(effect, failure => {
      if (
        failure.reason._tag === 'ApiErrors' &&
        failure.reason.code === DEPLOYMENT_NOT_FOUND_CODE
      ) {
        warning(`Cloudflare Deployment might have been deleted already: ${id}`)
        return Effect.void
      }
      return Effect.fail(failure)
    })
)
