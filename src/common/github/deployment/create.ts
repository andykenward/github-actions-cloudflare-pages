import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {graphql} from '@/gql/gql.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

import type {Environment} from '../environment.js'
import type {PayloadGithubDeploymentV2} from './types.js'

import {GitHubApi} from '../api/client.js'
import {GitHubContext} from '../context.js'
import {MutationCreateGitHubDeploymentStatus} from './status.js'

// oxlint-disable-next-line unicorn/throw-new-error
class GitHubDeploymentError extends Schema.TaggedError<GitHubDeploymentError>()(
  'GitHubDeploymentError',
  {message: Schema.String}
) {}

/**
 * @see {@link ../../../../schema/github/schema.graphql}
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#createdeployment | createDeployment}
 */
const MutationCreateGitHubDeployment = graphql(/* GraphQL */ `
  mutation CreateGitHubDeployment(
    $repositoryId: ID!
    $environmentName: String!
    $refId: ID!
    $payload: String!
    $description: String
  ) {
    createDeployment(
      input: {
        autoMerge: false
        description: $description
        environment: $environmentName
        refId: $refId
        repositoryId: $repositoryId
        requiredContexts: []
        payload: $payload
      }
    ) {
      deployment {
        ...DeploymentFragment
      }
    }
  }
`)

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
     * Create GitHub Deployment
     */
    const deployment = yield* github.request({
      query: MutationCreateGitHubDeployment,
      variables: {
        repositoryId: repo.node_id,
        environmentName: name,
        refId: refId,
        payload: JSON.stringify(payload),
        description: `Cloudflare Pages Deployment: ${id}`
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
      query: MutationCreateGitHubDeploymentStatus,
      variables: {
        environment: name,
        deploymentId: gitHubDeploymentId,
        environmentUrl: url,
        logUrl: getCloudflareLogEndpoint({id, accountId, projectName}),
        state: DeploymentStatusState.Success
      }
    })
  }
)
