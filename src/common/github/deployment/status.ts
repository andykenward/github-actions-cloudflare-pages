import {graphql} from '@/gql/gql.js'

/**
 * GitHub GraphQL Schema doesn't have Deployment Preview yet.
 * @see {@link ../../../schema/github-preview/schema.graphql}
 * @see {@link https://docs.github.com/en/graphql/overview/schema-previews#deployments-preview | Deployments Preview}
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
      deploymentStatus {
        deployment {
          ...DeploymentFragment
        }
      }
    }
  }
`)
