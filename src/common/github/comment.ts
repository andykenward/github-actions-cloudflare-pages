import {debug} from '@actions/core'

import {graphql} from '@/gql/gql.js'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {raise} from '@/common/utils.js'

import {request} from './api/client.js'
import {paginate} from './api/paginate.js'
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

const getNodeIdFromEvent = async () => {
  const {eventName, payload} = useContextEvent()

  if (eventName === 'workflow_dispatch') {
    const {repo} = useContext()
    const pullRequestsOpen = await paginate('GET /repos/{owner}/{repo}/pulls', {
      owner: repo.owner,
      repo: repo.repo,
      per_page: 100,
      state: 'open'
    })

    debug(JSON.stringify(pullRequestsOpen))

    const pullRequest = pullRequestsOpen.find(item => {
      return item.head.ref === payload.ref
    })

    debug(JSON.stringify(pullRequest))

    return pullRequest?.node_id ?? raise('No pull request node id')
  }
  if (eventName === 'pull_request' && payload.action !== 'closed') {
    return payload.pull_request.node_id ?? raise('No pull request node id')
  }
}

export const addComment = async (
  deployment: PagesDeployment,
  output: string
): Promise<string | undefined> => {
  const prNodeId = await getNodeIdFromEvent()

  if (prNodeId) {
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
