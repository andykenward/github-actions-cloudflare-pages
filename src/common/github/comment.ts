import assert from 'node:assert/strict'

import {info} from '@actions/core'
import * as Arr from 'effect/Array'
import * as Effect from 'effect/Effect'
import * as Schema from 'effect/Schema'

import type {PagesDeployment} from '@/common/cloudflare/types.js'
import type {WorkflowEvent} from '@/common/github/workflow-event/types.js'

import {getCloudflareDeploymentAlias} from '@/common/cloudflare/deployment/get.js'
import {githubUrl} from '@/common/html.js'
import {
  AddPullRequestCommentDocument,
  GetOpenPullRequestByBranchDocument,
  GetPullRequestCommentDocument,
  GetPullRequestIdDocument,
  UpdatePullRequestCommentDocument
} from '@/gql/graphql.js'

import {GitHubApi, GitHubApiError} from './api/client.js'
import {GitHubContext} from './context.js'

const PREFIX = 'comment -'

// oxlint-disable-next-line unicorn/throw-new-error
class CommentError extends Schema.TaggedError<
  CommentError,
  {readonly brand: unique symbol}
>()('CommentError', {
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

/** The first open pull request headed by the context branch. */
const pullRequestToCommentWorkflowDispatch = Effect.fn(
  'pullRequestToCommentWorkflowDispatch'
)(function* () {
  const {repo, branch} = yield* GitHubContext
  const github = yield* GitHubApi

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
})

type WorkflowRunPayload = Extract<
  WorkflowEvent,
  {eventName: 'workflow_run'}
>['payload']

/**
 * The single pull request in the `workflow_run` payload whose head matches
 * the run's branch and sha.
 */
const pullRequestToCommentWorkflowRun = Effect.fn(
  'pullRequestToCommentWorkflowRun'
)(function* (payload: WorkflowRunPayload) {
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
})

/**
 * The pull request to comment on — `pullRequestNumber` when the input is set, else
 * detected from the event — or `undefined` when there is none. It does not
 * depend on the deployment, so the deploy resolves it while wrangler runs.
 */
export const pullRequestToComment = Effect.fn('pullRequestToComment')(
  function* (pullRequestNumber?: number) {
    const {event} = yield* GitHubContext

    if (pullRequestNumber !== undefined) {
      return yield* pullRequestNodeId(
        pullRequestNumber,
        `No pull request node id found for pr-number input: ${pullRequestNumber}`
      )
    }

    const {eventName, payload} = event

    switch (eventName) {
      case 'workflow_dispatch': {
        return yield* pullRequestToCommentWorkflowDispatch()
      }
      case 'workflow_run': {
        return yield* pullRequestToCommentWorkflowRun(payload)
      }
      case 'pull_request': {
        if (payload.action === 'closed') {
          return
        }

        return payload.pull_request.node_id
      }
      default: {
        return
      }
    }
  }
)

/** What the comment's Status row says. */
export type CommentState = 'building' | 'ready' | 'failed' | 'cancelled'

const COMMENT_STATUS = {
  building: '🔄 Building',
  ready: '✅ Ready',
  failed: '❌ Failed',
  cancelled: '⏹ Cancelled or timed out'
} as const satisfies Record<CommentState, string>

/** GitHub's own abbreviation of a commit sha. */
const SHA_SHORT_LENGTH = 7

/** What a comment reports; the rows a state has no value for are left out. */
export type CommentContent = {
  state: CommentState
  environment: string
  projectName: string
  /** Set once Cloudflare reports the deployment as ready. */
  deployment?: PagesDeployment | undefined
  logUrl?: string | undefined
  /** A line under the table — why the action failed after deploying. */
  note?: string | undefined
  wranglerOutput?: string | undefined
}

/** A table cell: a `|` would end the cell, a line break the row. */
const commentCell = (text: string): string =>
  text.replaceAll('|', String.raw`\|`).replaceAll(/\r?\n/g, ' ')

const commentLink = (href: string, text = href): string =>
  `[${commentCell(text)}](${href})`

/** The deployment's rows, once Cloudflare reported it. */
const commentBodyDeploymentRows = (deployment: PagesDeployment) => [
  ['Preview URL', commentLink(deployment.url)],
  ['Branch Preview URL', commentLink(getCloudflareDeploymentAlias(deployment))]
]

/**
 * The comment's Markdown: one table, updated in place as the deploy moves on.
 * Wrangler's output goes in a code block, so nothing in it is read as
 * Markdown.
 */
export const commentBody = (
  content: CommentContent,
  {sha, repo, event}: Pick<GitHubContext['Service'], 'sha' | 'repo' | 'event'>
): string => {
  assert.ok(sha.length > SHA_SHORT_LENGTH)
  const {state, deployment, logUrl, note, wranglerOutput} = content
  const commit = githubUrl(repo.owner, repo.repo, 'commit', sha)
  const rows = [
    ['Status', COMMENT_STATUS[state]],
    ['Environment', commentCell(content.environment)],
    ['Project', commentCell(content.projectName)],
    ['Commit', `[\`${sha.slice(0, SHA_SHORT_LENGTH)}\`](${commit})`],
    ['Event', commentCell(event.eventName)],
    ...(deployment ? commentBodyDeploymentRows(deployment) : []),
    ...(logUrl ? [['Build log', commentLink(logUrl, 'View build log')]] : [])
  ]
  const body = [
    '## Cloudflare Pages Deployment',
    '',
    '| Name | Result |',
    '| --- | --- |',
    ...rows.map(([name, value]) => `| ${name} | ${value} |`),
    ...(note ? ['', `> ${commentCell(note)}`] : []),
    ...(wranglerOutput === undefined
      ? []
      : ['', '### Wrangler Output', '```', wranglerOutput, '```'])
  ].join('\n')
  assert.ok(body.includes(COMMENT_STATUS[state]))
  return body
}

/**
 * Whether `commentId` is a comment on `pullRequestId` that still exists. A
 * deleted comment answers `null` with a `NOT_FOUND` error.
 */
const upsertCommentIsOnPullRequest = Effect.fn('upsertCommentIsOnPullRequest')(
  function* (commentId: string, pullRequestId: string) {
    const github = yield* GitHubApi
    const {data, errors} = yield* github.request({
      query: GetPullRequestCommentDocument,
      variables: {id: commentId},
      options: {errorThrows: false}
    })
    if (errors?.some(error => error.type !== 'NOT_FOUND')) {
      return yield* GitHubApiError.fromGraphqlErrors(errors)
    }
    const node = data?.node
    return (
      node !== null &&
      node !== undefined &&
      'pullRequest' in node &&
      node.pullRequest?.id === pullRequestId
    )
  }
)

/** Replaces the body of the deployment comment `commentId`. */
export const updateComment = Effect.fn('updateComment')(function* (
  commentId: string,
  body: string
) {
  assert.ok(commentId.length > 0)
  const github = yield* GitHubApi
  yield* github.request({
    query: UpdatePullRequestCommentDocument,
    variables: {input: {id: commentId, body}}
  })
})

/**
 * Edits the previous deployment comment when it is still on this pull
 * request, else posts a new one — so a pull request keeps one comment. Returns
 * the comment id, or `undefined` when there is no pull request.
 */
export const upsertComment = Effect.fn('upsertComment')(function* (
  pullRequestId: string | undefined,
  previousCommentId: string | undefined,
  body: string
) {
  if (!pullRequestId) {
    info(`${PREFIX} No Pull Request could be found to post comment.`)
    return
  }

  if (
    previousCommentId &&
    (yield* upsertCommentIsOnPullRequest(previousCommentId, pullRequestId))
  ) {
    yield* updateComment(previousCommentId, body)
    return previousCommentId
  }

  const github = yield* GitHubApi
  const comment = yield* github.request({
    query: AddPullRequestCommentDocument,
    variables: {input: {subjectId: pullRequestId, body}}
  })
  return comment.data?.addComment?.commentEdge?.node?.id
})
