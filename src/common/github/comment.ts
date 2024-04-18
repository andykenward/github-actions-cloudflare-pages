import {graphql} from '@/gql/gql.js'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {raise} from '@/common/utils.js'

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
  deployment: PagesDeployment,
  output: string
): Promise<string | undefined> => {
  const {eventName, payload} = useContextEvent()

  if (eventName === 'pull_request' && payload.action !== 'closed') {
    const prNodeId =
      payload.pull_request.node_id ?? raise('No pull request node id')

    const {sha} = useContext()

    const rawBody = `## Cloudflare Pages Deployment\n**Environment:** ${deployment.environment}\n**Project:** ${deployment.project_name}\n**Built with commit:** ${sha}\n**Preview URL:** ${deployment.url}\n**Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}\n\n### Wrangler Output\n${output}`

    const comment = await request({
      query: MutationAddComment,
      variables: {
        subjectId: prNodeId,
        body: rawBody
      }
    })
    return comment.data.addComment?.commentEdge?.node?.id
  }
}
