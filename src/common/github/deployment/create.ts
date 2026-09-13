import assert from 'node:assert/strict'

import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {
  CreateGitHubDeploymentDocument,
  CreateGitHubDeploymentStatusDocument,
  DeploymentStatusState
} from '@/gql/graphql.js'

import type {Environment} from '../environment.js'

import {GitHubApi} from '../api/client.js'
import {GitHubContext} from '../context.js'
import {deploymentStatusInput} from './deployment-status.js'
import {PayloadV2} from './types.js'

// oxlint-disable-next-line unicorn/throw-new-error
class GitHubDeploymentError extends Schema.TaggedError<GitHubDeploymentError>()(
  'GitHubDeploymentError',
  {message: Schema.String}
) {}

/**
 * Writes the payload through the same schema `getPayload` decodes it with, so
 * the two cannot drift.
 */
const encodePayload = Schema.encodeSync(Schema.fromJsonString(PayloadV2))

export const createGitHubDeployment = Effect.fn('createGitHubDeployment')(
  function* ({
    cloudflareDeployment: {id, url, project_name: projectName},
    cloudflareAccountId: accountId,
    commentId,
    environment: {name, refId}
  }: {
    cloudflareDeployment: PagesDeployment
    cloudflareAccountId: string
    commentId: string | undefined
    environment: Environment
  }) {
    assert.ok(id.length > 0)
    assert.ok(refId.length > 0)
    assert.ok(URL.canParse(url))

    const {repo} = yield* GitHubContext
    const github = yield* GitHubApi

    const cloudflare = {id, projectName, accountId}

    /**
     * Create GitHub Deployment. `autoMerge` and `requiredContexts` are off:
     * the deployment records what Cloudflare already deployed.
     */
    const deployment = yield* github.request({
      query: CreateGitHubDeploymentDocument,
      variables: {
        input: {
          repositoryId: repo.node_id,
          refId,
          environment: name,
          description: `Cloudflare Pages Deployment: ${id}`,
          payload: encodePayload({url, commentId, cloudflare}),
          autoMerge: false,
          requiredContexts: []
        }
      }
    })
    const gitHubDeploymentId = deployment.data?.createDeployment?.deployment?.id

    if (!gitHubDeploymentId) {
      return yield* new GitHubDeploymentError({
        message: 'GitHub Deployment: GitHub deployment id is required'
      })
    }

    yield* github.request({
      query: CreateGitHubDeploymentStatusDocument,
      variables: {
        input: deploymentStatusInput({
          deploymentId: gitHubDeploymentId,
          environment: name,
          url,
          cloudflare,
          state: DeploymentStatusState.Success
        })
      }
    })
  }
)
