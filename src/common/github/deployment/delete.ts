import {graphql} from '@/gql/gql.js'

export const MutationDeleteGitHubDeployment = graphql(/* GraphQL */ `
  mutation DeleteGitHubDeployment($deploymentId: ID!) {
    deleteDeployment(input: {id: $deploymentId}) {
      clientMutationId
    }
  }
`)

export const MutationDeleteGitHubDeploymentAndComment = graphql(/* GraphQL */ `
  mutation DeleteGitHubDeploymentAndComment(
    $deploymentId: ID!
    $commentId: ID!
  ) {
    deleteDeployment(input: {id: $deploymentId}) {
      clientMutationId
    }
    deleteIssueComment(input: {id: $commentId}) {
      clientMutationId
    }
  }
`)
