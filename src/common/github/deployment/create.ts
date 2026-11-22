import assert from 'node:assert/strict'

import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {CloudflareApiEndpoint} from '@/common/cloudflare/api/endpoints.js'

import {
  CreateGitHubDeploymentDocument,
  CreateGitHubDeploymentStatusDocument,
  DeploymentStatusState
} from '@/gql/graphql.js'

import type {Environment} from '../environment.js'
import type {CloudflareStatusFields} from './deployment-status.js'

import {GitHubApi} from '../api/client.js'
import {GitHubContext} from '../context.js'
import {deploymentStatusInput} from './deployment-status.js'
import {PAYLOAD_VERSION, PayloadV3} from './types.js'

// oxlint-disable-next-line unicorn/throw-new-error
class GitHubDeploymentError extends Schema.TaggedError<
  GitHubDeploymentError,
  {readonly brand: unique symbol}
>()('GitHubDeploymentError', {message: Schema.String}) {}

/**
 * Writes the payload through the same schema `getPayload` decodes it with, so
 * the two cannot drift.
 */
const encodePayload = Schema.encodeSync(Schema.fromJsonString(PayloadV3))

/** Sets the status of the GitHub Deployment `deploymentId`. */
export const setGitHubDeploymentStatus = Effect.fn('setGitHubDeploymentStatus')(
  function* (
    status: {
      deploymentId: string
      environment: string
      state: DeploymentStatusState
    } & CloudflareStatusFields
  ) {
    assert.ok(status.deploymentId.length > 0)
    const github = yield* GitHubApi
    yield* github.request({
      query: CreateGitHubDeploymentStatusDocument,
      variables: {input: deploymentStatusInput(status)}
    })
  }
)

/**
 * Records the GitHub Deployment before wrangler runs, as `IN_PROGRESS`, so a
 * failed build still shows on the pull request. `autoMerge` and
 * `requiredContexts` are off: the deployment records what Cloudflare deploys.
 * Returns its node id, for the final status.
 */
export const createGitHubDeployment = Effect.fn('createGitHubDeployment')(
  function* ({
    cloudflare,
    commentId,
    environment: {name, refId}
  }: {
    cloudflare: CloudflareApiEndpoint
    commentId: string | undefined
    environment: Environment
  }) {
    assert.ok(refId.length > 0)
    assert.ok(cloudflare.projectName.length > 0)

    const {repo} = yield* GitHubContext
    const github = yield* GitHubApi

    const deployment = yield* github.request({
      query: CreateGitHubDeploymentDocument,
      variables: {
        input: {
          repositoryId: repo.node_id,
          refId,
          environment: name,
          description: `Cloudflare Pages: ${cloudflare.projectName}`,
          payload: encodePayload({
            version: PAYLOAD_VERSION,
            commentId,
            cloudflare
          }),
          autoMerge: false,
          requiredContexts: []
        }
      }
    })
    const deploymentId = deployment.data?.createDeployment?.deployment?.id

    if (!deploymentId) {
      return yield* new GitHubDeploymentError({
        message: 'GitHub Deployment: GitHub deployment id is required'
      })
    }

    yield* setGitHubDeploymentStatus({
      deploymentId,
      environment: name,
      state: DeploymentStatusState.InProgress
    })
    return deploymentId
  }
)
