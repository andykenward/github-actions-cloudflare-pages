import {graphql} from '@/gql/gql.js'

/**
 * @see {@link ../../../../schema/github/schema.graphql}
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#createdeploymentstatus | createdeploymentstatus}
 */
export const MutationCreateGitHubDeploymentStatus = graphql(/* GraphQL */ `
  mutation CreateGitHubDeploymentStatus(
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
      clientMutationId
    }
  }
`)
