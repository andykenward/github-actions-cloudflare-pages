import {graphql} from '@/gql/gql.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareLogEndpoint} from '@/common/cloudflare/api/endpoints.js'
import {raise} from '@/common/utils.js'

import type {PayloadGithubDeploymentV2} from './types.js'

import {request} from '../api/client.js'
import {useContext} from '../context.js'
import {checkEnvironment} from '../environment.js'
import {MutationCreateGitHubDeploymentStatus} from './status.js'

/**
 * GitHub GraphQL Schema doesn't have Deployment Preview yet.
 * @see {@link ../../../schema/github-preview/schema.graphql}
 * @see {@link https://docs.github.com/en/graphql/overview/schema-previews#deployments-preview | Deployments Preview}
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#createdeployment | createDeployment}
 */
export const MutationCreateGitHubDeployment = graphql(/* GraphQL */ `
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

export const createGitHubDeployment = async ({
  cloudflareDeployment: {id, url, project_name: projectName},
  cloudflareAccountId: accountId,
  commentId
}: {
  cloudflareDeployment: PagesDeployment
  cloudflareAccountId: string
  commentId: string | undefined
}) => {
  /**
   * Check GitHub Environment exists to link GitHub Deployment too.
   */
  const {name, refId} =
    (await checkEnvironment()) ??
    raise('GitHub Deployment: GitHub Environment is required')

  const {repo} = useContext()

  const payload: PayloadGithubDeploymentV2 = {
    cloudflare: {id, projectName, accountId},
    url,
    commentId
  }

  /**
   * Create GitHub Deployment
   */
  const deployment = await request({
    query: MutationCreateGitHubDeployment,
    variables: {
      repositoryId: repo.node_id,
      environmentName: name,
      refId: refId,
      payload: JSON.stringify(payload),
      description: `Cloudflare Pages Deployment: ${id}`
    }
  })
  const gitHubDeploymentId =
    deployment.data.createDeployment?.deployment?.id ??
    raise('GitHub Deployment: GitHub deployment id is required')

  /**
   * Update GitHub Deployment Status
   */
  await request({
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
