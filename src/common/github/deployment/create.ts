import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {
  CreateGitHubDeploymentDocument,
  CreateGitHubDeploymentStatusDocument,
  DeploymentStatusState
} from '@/gql/graphql.js'

import type {Environment} from '../environment.js'
import type {PayloadGithubDeploymentV2} from './types.js'

import {GitHubApi} from '../api/client.js'
import {GitHubContext} from '../context.js'

// oxlint-disable-next-line unicorn/throw-new-error
class GitHubDeploymentError extends Schema.TaggedError<GitHubDeploymentError>()(
  'GitHubDeploymentError',
  {message: Schema.String}
) {}

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
    const {repo} = yield* GitHubContext
    const github = yield* GitHubApi

    const payload: PayloadGithubDeploymentV2 = {
      cloudflare: {id, projectName, accountId},
      url,
      commentId
    }

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
          payload: JSON.stringify(payload),
          autoMerge: false,
          requiredContexts: []
        }
      }
    })
    const gitHubDeploymentId = deployment.data.createDeployment?.deployment?.id

    if (!gitHubDeploymentId) {
      return yield* new GitHubDeploymentError({
        message: 'GitHub Deployment: GitHub deployment id is required'
      })
    }

    /**
     * Update GitHub Deployment Status
     */
    yield* github.request({
      query: CreateGitHubDeploymentStatusDocument,
      variables: {
        input: {
          deploymentId: gitHubDeploymentId,
          environment: name,
          environmentUrl: url,
          logUrl: getCloudflareLogEndpoint({id, accountId, projectName}),
          state: DeploymentStatusState.Success,
          autoInactive: false
        }
      }
    })
  }
)
