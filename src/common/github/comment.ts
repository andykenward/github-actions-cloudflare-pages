import {info} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {CommonInputs} from '@/common/inputs.js'
import {graphql} from '@/gql/gql.js'

import {GitHubApi} from './api/client.js'
import {GitHubContext} from './context.js'

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

// oxlint-disable-next-line unicorn/throw-new-error
class CommentError extends Schema.TaggedError<CommentError>()('CommentError', {
  message: Schema.String
}) {}

/** The pull request to comment on, or `undefined` when there is none. */
const nodeIdFromEvent = Effect.gen(function* () {
  const {repo, branch, event} = yield* GitHubContext
  const {prNumber} = yield* CommonInputs
  const github = yield* GitHubApi

  if (prNumber) {
    const parsedPrNumber = Number.parseInt(prNumber, 10)
    if (!Number.isInteger(parsedPrNumber) || parsedPrNumber <= 0) {
      return yield* new CommentError({
        message: `Invalid pr-number input: ${prNumber}`
      })
    }

    const pullRequest = yield* github.request({
      query: QueryPullRequestNodeId,
      variables: {
        owner: repo.owner,
        repo: repo.repo,
        number: parsedPrNumber
      }
    })

    const nodeId = pullRequest.data.repository?.pullRequest?.id
    if (!nodeId) {
      return yield* new CommentError({
        message: `No pull request node id found for pr-number input: ${prNumber}`
      })
    }
    return nodeId
  }

  const {eventName, payload} = event

  switch (eventName) {
    case 'workflow_dispatch': {
      if (!branch) {
        return yield* new CommentError({message: 'No branch found in context'})
      }

      const pullRequest = yield* github.request({
        query: QueryPullRequestNodeIdByBranch,
        variables: {
          owner: repo.owner,
          repo: repo.repo,
          headRefName: branch
        }
      })

      const nodeId = pullRequest.data.repository?.pullRequests.nodes?.[0]?.id
      if (!nodeId) {
        return yield* new CommentError({
          message: 'No pull request node id found for workflow_dispatch event'
        })
      }
      return nodeId
    }
    case 'workflow_run': {
      const pullRequestsMatchingHead =
        payload.workflow_run.pull_requests.filter(pullRequest => {
          return (
            pullRequest !== null &&
            pullRequest.head.ref === payload.workflow_run.head_branch &&
            pullRequest.head.sha === payload.workflow_run.head_sha
          )
        })

      if (pullRequestsMatchingHead.length === 0) {
        return yield* new CommentError({
          message:
            'No pull request found in workflow_run event matching head branch and sha'
        })
      }

      if (pullRequestsMatchingHead.length > 1) {
        return yield* new CommentError({
          message:
            'Multiple pull requests found in workflow_run event matching head branch and sha'
        })
      }

      const pullRequestNumber = pullRequestsMatchingHead[0]?.number

      if (!pullRequestNumber) {
        return yield* new CommentError({
          message: 'No pull request number found in workflow_run event'
        })
      }

      const pullRequest = yield* github.request({
        query: QueryPullRequestNodeId,
        variables: {
          owner: repo.owner,
          repo: repo.repo,
          number: pullRequestNumber
        }
      })

      const nodeId = pullRequest.data.repository?.pullRequest?.id
      if (!nodeId) {
        return yield* new CommentError({
          message: 'No pull request node id found for workflow_run event'
        })
      }
      return nodeId
    }
    case 'pull_request': {
      if (payload.action === 'closed') {
        return
      }

      const nodeId = payload.pull_request.node_id
      if (!nodeId) {
        return yield* new CommentError({
          message: 'No pull request node id found for pull_request event'
        })
      }
      return nodeId
    }
    default: {
      return
    }
  }
})

export const addComment = Effect.fn('addComment')(function* (
  deployment: PagesDeployment,
  output: string
) {
  const prNodeId = yield* nodeIdFromEvent

  if (!prNodeId) {
    info('addComment - No Pull Request could be found to post comment.')
    return
  }

  const {sha, event} = yield* GitHubContext
  const github = yield* GitHubApi

  const rawBody = `## Cloudflare Pages Deployment\n**Event Name:** ${event.eventName}\n**Environment:** ${deployment.environment}\n**Project:** ${deployment.project_name}\n**Built with commit:** ${sha}\n**Preview URL:** ${deployment.url}\n**Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}\n\n### Wrangler Output\n${output}`

  const comment = yield* github.request({
    query: MutationAddComment,
    variables: {
      subjectId: prNodeId,
      body: rawBody
    }
  })
  return comment.data.addComment?.commentEdge?.node?.id
})
