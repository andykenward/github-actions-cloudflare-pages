import type {
  Deployment,
  DeploymentStatus,
  Exact,
  Maybe,
  Scalars
} from '@/gql/graphql.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

import type {PagesDeployment} from '../cloudflare/types.js'
import {getCloudflareLogEndpoint} from '../cloudflare/api/endpoints.js'
import {raise} from '../utils.js'
import {request} from './api/client.js'
import {useContext} from './context.js'
import {checkEnvironment} from './environment.js'

/**
 * GitHub GraphQL Schema doesn't have Deployment Preview yet.
 * So can't use codgen for type information.
 * @see {@link https://docs.github.com/en/graphql/overview/schema-previews#deployments-preview | Deployments Preview}
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#createdeployment | createDeployment}
 */
export const MutationCreateDeployment = `
  mutation CreateDeployment(
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
        id
        environment
        state
      }
    }
  }
`
/**
 * Have to manually create type information. See above GraphQL query.
 */
type CreateDeploymentMutation = Partial<{
  createDeployment: Maybe<{
    deployment?: Maybe<Pick<Deployment, 'environment' | 'state' | 'id'>>
  }>
}>
type CreateDeploymentMutationVariables = Exact<{
  repositoryId: Scalars['ID']['input']
  environmentName: Scalars['String']['input']
  refId: Scalars['ID']['input']
  payload: Scalars['String']['input']
  description: Scalars['String']['input']
}>

/**
 * GitHub GraphQL Schema doesn't have Deployment Preview yet.
 * So can't use codgen for type information.
 * @see {@link https://docs.github.com/en/graphql/overview/schema-previews#deployments-preview | Deployments Preview}
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#createdeploymentstatus | createdeploymentstatus}
 */
export const MutationCreateDeploymentStatus = `
  mutation CreateDeploymentStatus(
    $deploymentId: ID!
    $environment: String
    $environmentUrl: String!
    $logUrl: String!
    $state: DeploymentStatusState!
  ) {
    createDeploymentStatus(
      input: {
        autoInactive: false
        deploymentId: $deploymentId
        environment: $environment
        environmentUrl: $environmentUrl
        logUrl: $logUrl
        state: $state
      }
    ) {
      deploymentStatus {
        createdAt
        deployment {
          id
          environment
          state
        }
        state
        environmentUrl
      }
    }
  }
`
/**
 * Have to manually create type information. See above GraphQL query.
 */
export type CreateDeploymentStatusMutation = Partial<{
  createDeploymentStatus: Maybe<{
    deploymentStatus: Maybe<
      Pick<DeploymentStatus, 'environmentUrl' | 'createdAt' | 'state'> & {
        deployment: Maybe<Pick<Deployment, 'id' | 'environment' | 'state'>>
      }
    >
  }>
}>
export type CreateDeploymentStatusMutationVariables = Exact<{
  deploymentId: Scalars['ID']['input']
  environment: Scalars['String']['input']
  environmentUrl: Scalars['String']['input']
  logUrl: Scalars['String']['input']
  state: DeploymentStatusState
}>

export type DeploymentPayload = {
  cloudflareId: string
  url: string
  commentId: Scalars['ID']['input'] | undefined
}

export const createGitHubDeployment = async (
  {id, url}: PagesDeployment,
  commentId: string | undefined
) => {
  /**
   * Check GitHub Environment exists to link GitHub Deployment too.
   */
  const {name, refId} =
    (await checkEnvironment()) ??
    raise('GitHub Deployment: GitHub Environment is required')

  const {repo} = useContext()

  const payload: DeploymentPayload = {cloudflareId: id, url, commentId}

  /**
   * Create GitHub Deployment
   */
  const deployment = await request<
    CreateDeploymentMutation,
    CreateDeploymentMutationVariables
  >({
    query: MutationCreateDeployment,
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
  await request<
    CreateDeploymentStatusMutation,
    CreateDeploymentStatusMutationVariables
  >({
    query: MutationCreateDeploymentStatus,
    variables: {
      environment: name,
      deploymentId: gitHubDeploymentId,
      environmentUrl: url,
      logUrl: getCloudflareLogEndpoint(id),
      state: DeploymentStatusState.Success
    }
  })
}
