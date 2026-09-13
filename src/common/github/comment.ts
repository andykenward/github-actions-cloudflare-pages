import {info} from '@actions/core'
import * as Arr from 'effect/Array'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {
  AddPullRequestCommentDocument,
  GetOpenPullRequestByBranchDocument,
  GetPullRequestIdDocument
} from '@/gql/graphql.js'

import {GitHubApi, GitHubApiError} from './api/client.js'
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

  const {data, errors} = yield* github.request({
    query: GetPullRequestIdDocument,
    variables: {
      owner: repo.owner,
      repo: repo.repo,
      number
    },
    options: {errorThrows: false}
  })

  // `[].every` is true, so an empty array must not read as not found.
  if (errors && Arr.isArrayNonEmpty(errors)) {
    // GitHub answers a pull request that doesn't exist with a NOT_FOUND error.
    return yield* errors.every(error => error.type === 'NOT_FOUND')
      ? new CommentError({message: notFound})
      : GitHubApiError.fromGraphqlErrors(errors)
  }

  const nodeId = data?.repository?.pullRequest?.id
  if (!nodeId) {
    return yield* new CommentError({message: notFound})
  }
  return nodeId
})

/**
 * The pull request to comment on — `prNumber` when the input is set, else
 * detected from the event — or `undefined` when there is none. It does not
 * depend on the deployment, so the deploy resolves it while wrangler runs.
 */
export const pullRequestToComment = Effect.fn('pullRequestToComment')(
  function* (prNumber: number | undefined) {
    const {repo, branch, event} = yield* GitHubContext
    const github = yield* GitHubApi

    if (prNumber !== undefined) {
      return yield* pullRequestNodeId(
        prNumber,
        `No pull request node id found for pr-number input: ${prNumber}`
      )
    }

    const {eventName, payload} = event

    switch (eventName) {
      case 'workflow_dispatch': {
        const pullRequest = yield* github.request({
          query: GetOpenPullRequestByBranchDocument,
          variables: {
            owner: repo.owner,
            repo: repo.repo,
            headRefName: branch
          }
        })

        const nodeId = pullRequest.data?.repository?.pullRequests.nodes?.[0]?.id
        if (!nodeId) {
          return yield* new CommentError({
            message: 'No pull request node id found for workflow_dispatch event'
          })
        }
        return nodeId
      }
      case 'workflow_run': {
        const {head_branch, head_sha} = payload.workflow_run
        const [match, ...rest] = payload.workflow_run.pull_requests.filter(
          pullRequest =>
            pullRequest !== null &&
            pullRequest.head.ref === head_branch &&
            pullRequest.head.sha === head_sha
        )

        if (!match) {
          return yield* new CommentError({
            message:
              'No pull request found in workflow_run event matching head branch and sha'
          })
        }

        if (rest.length > 0) {
          return yield* new CommentError({
            message:
              'Multiple pull requests found in workflow_run event matching head branch and sha'
          })
        }

        return yield* pullRequestNodeId(
          match.number,
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
  }
)

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

  // Wrangler's output goes in a code block, so nothing in it is read as
  // markdown.
  const rawBody = [
    '## Cloudflare Pages Deployment',
    `**Event Name:** ${event.eventName}`,
    `**Environment:** ${deployment.environment}`,
    `**Project:** ${deployment.project_name}`,
    `**Built with commit:** ${sha}`,
    `**Preview URL:** ${deployment.url}`,
    `**Branch Preview URL:** ${getCloudflareDeploymentAlias(deployment)}`,
    '',
    '### Wrangler Output',
    '```',
    output,
    '```'
  ].join('\n')

  const comment = yield* github.request({
    query: AddPullRequestCommentDocument,
    variables: {
      input: {subjectId: pullRequestId, body: rawBody}
    }
  })
  return comment.data?.addComment?.commentEdge?.node?.id
})
