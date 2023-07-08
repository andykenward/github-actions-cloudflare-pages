import {graphql} from '@/gql/gql.js'

import type {PagesDeployment} from '../cloudflare/types.js'
import {getDeploymentAlias} from '../cloudflare/deployments.js'
import {raise} from '../utils.js'
import {request} from './api/client.js'
import {useContext, useContextEvent} from './context.js'

export const MutationAddComment = graphql(/* GraphQL */ `
  mutation AddComment($subjectId: ID!, $body: String!) {
    addComment(input: {subjectId: $subjectId, body: $body}) {
      commentEdge {
        node {
          id
        }
      }
    }
  }
`)

export const addComment = async (
  deployment: PagesDeployment
): Promise<string | undefined> => {
  const {eventName, payload} = useContextEvent()

  if (eventName === 'pull_request') {
    const prNodeId =
      payload.pull_request.node_id ?? raise('No pull request node id')

    const {sha} = useContext()

    const rawBody = `## Cloudflare Pages Deployment\n **Environment:** ${
      deployment.environment
    } \n **Project:** ${
      deployment.project_name
    } \n **Built with commit:** ${sha}\n **Preview URL:** ${
      deployment.url
    } \n **Branch Preview URL:** ${getDeploymentAlias(deployment)}`

    const comment = await request({
      query: MutationAddComment,
      variables: {
        subjectId: prNodeId,
        body: rawBody
      }
    })
    return comment.data.addComment?.commentEdge?.node?.id
  }
  throw new Error('Not a pull request')
}
