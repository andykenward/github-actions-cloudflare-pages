import {info} from '@actions/core'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {raise} from '@/common/utils.js'
import {graphql} from '@/gql/gql.js'

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

export const QueryPullRequestNodeId = graphql(/* GraphQL */ `
  query PullRequestNodeId($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        id
      }
    }
  }
`)

export const QueryPullRequestNodeIdByBranch = graphql(/* GraphQL */ `
  query PullRequestNodeIdByBranch(
    $owner: String!
    $repo: String!
    $headRefName: String!
  ) {
    repository(owner: $owner, name: $repo) {
      pullRequests(first: 1, states: [OPEN], headRefName: $headRefName) {
        nodes {
          id
        }
      }
    }
  }
`)

const getNodeIdFromEvent = async () => {
  const {eventName, payload} = useContextEvent()

  switch (eventName) {
    case 'workflow_dispatch': {
      const {repo, branch} = useContext()

      const pullRequest = await request({
        query: QueryPullRequestNodeIdByBranch,
        variables: {
          owner: repo.owner,
          repo: repo.repo,
          headRefName: branch ?? raise('No branch found in context')
        }
      })

      return (
        pullRequest.data.repository?.pullRequests.nodes?.[0]?.id ??
        raise('No pull request node id found for workflow_dispatch event')
      )
    }
    case 'workflow_run': {
      const pullRequestNumber = payload.workflow_run.pull_requests[0]?.number

      if (!pullRequestNumber) {
        raise('No pull request number found in workflow_run event')
      }

      const {repo} = useContext()

      const pullRequest = await request({
        query: QueryPullRequestNodeId,
        variables: {
          owner: repo.owner,
          repo: repo.repo,
          number: pullRequestNumber
        }
      })

      return (
        pullRequest.data.repository?.pullRequest?.id ??
        raise('No pull request node id found for workflow_run event')
      )
    }
    case 'pull_request': {
      if (payload.action === 'closed') {
        return
      }

      return (
        payload.pull_request.node_id ??
        raise('No pull request node id found for pull_request event')
      )
    }
    default: {
      return
    }
  }
}

export const addComment = async (
  deployment: PagesDeployment,
  output: string
): Promise<string | undefined> => {
  const prNodeId = await getNodeIdFromEvent()

  if (prNodeId) {
    const {sha} = useContext()
    const {eventName} = useContextEvent()

    const rawBody = `## Cloudflare Pages Deployment\n**Event Name:** ${eventName}\n**Environment:** ${deployment.environment}\n**Project:** ${deployment.project_name}\n**Built with commit:** ${sha}\n**Preview URL:** ${deployment.url}\n**Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}\n\n### Wrangler Output\n${output}`

    const comment = await request({
      query: MutationAddComment,
      variables: {
        subjectId: prNodeId,
        body: rawBody
      }
    })
    return comment.data.addComment?.commentEdge?.node?.id
  }
  info('addComment - No Pull Request could be found to post comment.')
}
