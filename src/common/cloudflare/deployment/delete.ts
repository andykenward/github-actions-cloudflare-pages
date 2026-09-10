import {error, info, warning} from '@actions/core'
import * as Effect from 'effect/Effect'

import {CloudflareApi, CloudflareApiError} from '../api/client.js'
import {unwrapSuccess} from '../api/fetch-result.js'
import {ParseError} from '../api/parse-error.js'

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

/** Succeeds with whether the deployment is gone; never fails. */
export const deleteCloudflareDeployment = Effect.fn(
  'deleteCloudflareDeployment'
)(
  function* ({
    id,
    accountId,
    projectName
  }: {
    /** deploymentIdentifier */
    id: string
    accountId: string
    projectName: string
  }) {
    const cloudflare = yield* CloudflareApi

    const success = yield* Effect.tryPromise({
      try: async () =>
        unwrapSuccess(
          await cloudflare.DELETE(
            '/accounts/{account_id}/pages/projects/{project_name}/deployments/{deployment_id}',
            {
              params: {
                path: {
                  account_id: accountId,
                  project_name: projectName,
                  deployment_id: id
                },
                query: {force: true}
              }
            }
          )
        ),
      catch: CloudflareApiError.from
    })

    if (!success) {
      return yield* new CloudflareApiError({
        message: 'Cloudflare Delete Deployment: fail',
        cause: undefined
      })
    }

    info(`Cloudflare Deployment Deleted: ${id}`)
    return true
  },
  (effect, {id}) =>
    Effect.catch(effect, failure => {
      if (
        failure.cause instanceof ParseError &&
        failure.cause.code === DEPLOYMENT_NOT_FOUND_CODE
      ) {
        warning(`Cloudflare Deployment might have been deleted already: ${id}`)
        return Effect.succeed(true)
      }
      // Include the reason: previously only the id was logged, so a failed
      // delete gave no indication of why.
      error(`Cloudflare Error deleting deployment: ${id} - ${failure.message}`)
      return Effect.succeed(false)
    })
)
