import {graphql} from '@/gql/gql.js'

/**
 * Marks the deployment `INACTIVE`, then deletes it, in one request. Mutation
 * fields run in order, so the status is set before the delete; an error in
 * one field does not stop the next.
 * @see {@link https://docs.github.com/en/graphql/reference/mutations#deletedeployment | deleteDeployment}
 */
export const MutationDeactivateAndDeleteGitHubDeployment =
  graphql(/* GraphQL */ `
    mutation DeactivateAndDeleteGitHubDeployment(
      $deploymentId: ID!
      $environment: String
      $environmentUrl: String!
      $logUrl: String!
    ) {
      createDeploymentStatus(
        input: {
          autoInactive: false
          deploymentId: $deploymentId
          environment: $environment
          environmentUrl: $environmentUrl
          logUrl: $logUrl
          state: INACTIVE
        }
      ) {
        clientMutationId
      }
      deleteDeployment(input: {id: $deploymentId}) {
        clientMutationId
      }
    }
  `)

/** As `MutationDeactivateAndDeleteGitHubDeployment`, also deleting its comment. */
export const MutationDeactivateAndDeleteGitHubDeploymentAndComment =
  graphql(/* GraphQL */ `
    mutation DeactivateAndDeleteGitHubDeploymentAndComment(
      $deploymentId: ID!
      $environment: String
      $environmentUrl: String!
      $logUrl: String!
      $commentId: ID!
    ) {
      createDeploymentStatus(
        input: {
          autoInactive: false
          deploymentId: $deploymentId
          environment: $environment
          environmentUrl: $environmentUrl
          logUrl: $logUrl
          state: INACTIVE
        }
      ) {
        clientMutationId
      }
      deleteDeployment(input: {id: $deploymentId}) {
        clientMutationId
      }
      deleteIssueComment(input: {id: $commentId}) {
        clientMutationId
      }
    }
  `)
