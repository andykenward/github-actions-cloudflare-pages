import {info} from '@actions/core'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {CommonInputs} from '@/common/inputs.js'
import {
  AddPullRequestCommentDocument,
  GetOpenPullRequestByBranchDocument,
  GetPullRequestIdDocument
} from '@/gql/graphql.js'

import {GitHubApi} from './api/client.js'
import {GitHubContext} from './context.js'

// oxlint-disable-next-line unicorn/throw-new-error
class CommentError extends Schema.TaggedError<CommentError>()('CommentError', {
  message: Schema.String
}) {}

/** The node id of pull request `number`, failing with `notFound` if none. */
const pullRequestNodeId = Effect.fn('pullRequestNodeId')(function* (
  number: number,
  notFound: string
) {
  const {repo} = yield* GitHubContext
  const github = yield* GitHubApi

  const pullRequest = yield* github.request({
    query: GetPullRequestIdDocument,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      number
    }
  })

  const nodeId = pullRequest.data.repository?.pullRequest?.id
  if (!nodeId) {
    return yield* new CommentError({message: notFound})
  }
  return nodeId
})

/**
 * The pull request to comment on, or `undefined` when there is none. It does
 * not depend on the deployment, so the deploy resolves it while wrangler runs.
 */
export const pullRequestToComment = Effect.gen(function* () {
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

    return yield* pullRequestNodeId(
      parsedPrNumber,
      `No pull request node id found for pr-number input: ${prNumber}`
    )
  }

  const {eventName, payload} = event

  switch (eventName) {
    case 'workflow_dispatch': {
      if (!branch) {
        return yield* new CommentError({message: 'No branch found in context'})
      }

      const pullRequest = yield* github.request({
        query: GetOpenPullRequestByBranchDocument,
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

      return yield* pullRequestNodeId(
        pullRequestNumber,
        'No pull request node id found for workflow_run event'
      )
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

/** Posts the deployment comment on `pullRequestId`, when there is one. */
export const addComment = Effect.fn('addComment')(function* (
  pullRequestId: string | undefined,
  deployment: PagesDeployment,
  output: string
) {
  if (!pullRequestId) {
    info('addComment - No Pull Request could be found to post comment.')
    return
  }

  const {sha, event} = yield* GitHubContext
  const github = yield* GitHubApi

  const rawBody = `## Cloudflare Pages Deployment\n**Event Name:** ${event.eventName}\n**Environment:** ${deployment.environment}\n**Project:** ${deployment.project_name}\n**Built with commit:** ${sha}\n**Preview URL:** ${deployment.url}\n**Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}\n\n### Wrangler Output\n${output}`

  const comment = yield* github.request({
    query: AddPullRequestCommentDocument,
    variables: {
      input: {subjectId: pullRequestId, body: rawBody}
    }
  })
  return comment.data.addComment?.commentEdge?.node?.id
})
