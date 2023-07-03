import {getInput} from '@unlike/github-actions-core'

import type {
  Deployment,
  DeploymentStatus,
  Exact,
  Maybe,
  Scalars
} from '@/gql/graphql.js'
import {DeploymentStatusState} from '@/gql/graphql.js'

import type {PagesDeployment} from '../cloudflare/types.js'
import {
  ACTION_INPUT_ACCOUNT_ID,
  ACTION_INPUT_PROJECT_NAME
} from '../constants.js'
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
mutation CreateDeployment($repositoryId: ID!, $environmentName: String!, $refId: ID!) {
    createDeployment(input: {
        autoMerge: false,
        description: "Deployed from GitHub Actions",
        environment: $environmentName,
        refId: $refId,
        repositoryId: $repositoryId
        requiredContexts: []
    }) {
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
type CreateDeploymentStatusMutation = Partial<{
  createDeploymentStatus: Maybe<{
    deploymentStatus: Maybe<
      Pick<DeploymentStatus, 'environmentUrl' | 'createdAt' | 'state'> & {
        deployment: Maybe<Pick<Deployment, 'id' | 'environment' | 'state'>>
      }
    >
  }>
}>
type CreateDeploymentStatusMutationVariables = Exact<{
  deploymentId: Scalars['ID']['input']
  environment: Scalars['String']['input']
  environmentUrl: Scalars['String']['input']
  logUrl: Scalars['String']['input']
  state: DeploymentStatusState
}>

export const createGitHubDeployment = async (
  cloudflareDeployment: PagesDeployment
) => {
  const gitHubEnvironment = await checkEnvironment()
  if (!gitHubEnvironment) {
    throw new Error('GitHub Deployment: GitHub Environment is required')
  }
  const gitHubEnvironmentName = gitHubEnvironment.name
  const gitHubEnvironmentRefId = gitHubEnvironment.refId
  const {repo} = useContext()

  // Cloudflare
  const accountIdentifier = getInput(ACTION_INPUT_ACCOUNT_ID, {
    required: true
  })
  const projectName = getInput(ACTION_INPUT_PROJECT_NAME, {required: true})
  const pagesDeploymentId = cloudflareDeployment.id
  const pagesDeploymentUrl = cloudflareDeployment.url

  // Create GitHub Deployment
  const deployment = await request<
    CreateDeploymentMutation,
    CreateDeploymentMutationVariables
  >({
    query: MutationCreateDeployment,
    variables: {
      repositoryId: repo.id,
      environmentName: gitHubEnvironmentName,
      refId: gitHubEnvironmentRefId
    }
  })

  const gitHubDeploymentId = deployment.data.createDeployment?.deployment?.id
  if (!gitHubDeploymentId) {
    throw new Error('deployment id not found')
  }

  const updateDeployment = await request<
    CreateDeploymentStatusMutation,
    CreateDeploymentStatusMutationVariables
  >({
    query: MutationCreateDeploymentStatus,
    variables: {
      environment: gitHubEnvironmentName,
      deploymentId: gitHubDeploymentId,
      environmentUrl: pagesDeploymentUrl,
      logUrl: `https://dash.cloudflare.com/${accountIdentifier}/pages/view/${projectName}/${pagesDeploymentId}`,
      state: DeploymentStatusState.Success
    }
  })

  // eslint-disable-next-line no-console
  console.dir(updateDeployment)

  //   pagesDeployment.url
  //   pagesDeployment.project_name
  //   pagesDeployment.id

  //   if (deployment.data.createDeployment?.deployment.id){

  // update deployment status with pages deployment url

  //   log_url: `https://dash.cloudflare.com/${accountId}/pages/view/${projectName}/${deploymentId}`,
}
