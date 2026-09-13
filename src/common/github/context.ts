import assert from 'node:assert/strict'

import {debug, isDebug} from '@actions/core'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import type {WorkflowEvent} from './workflow-event/types.js'

import {errorMessage} from '../errors.js'
import {raise} from '../utils.js'
import {getWorkflowEvent} from './workflow-event/workflow-event.js'

export interface Repo {
  owner: string
  repo: string
  /**
   * The GraphQL identifier of the repository.
   */
  node_id: string
}

interface GitHubContextShape {
  /**
   * The event that triggered the workflow run.
   */
  event: WorkflowEvent
  repo: Repo
  /**
   * The branch or tag ref that triggered the workflow run.
   */
  branch: string
  /**
   * The commit SHA that triggered the workflow. The value of this commit SHA
   * depends on the event that triggered the workflow.
   * For more information, see "Events that trigger workflows."
   *
   * Example: `ffac537e6cbbf934b08745a378932722df287a53`.
   */
  sha: string
  /**
   * Returns the GraphQL API URL. For example: https://api.github.com/graphql.
   */
  graphqlEndpoint: string
  /**
   * Returns the REST API URL. For example: https://api.github.com.
   */
  apiUrl: string

  /**
   * refs/heads/feature-branch-1.
   */
  ref: string
}

const getGitHubContextRepo = (event: WorkflowEvent): Repo => {
  const [owner, repo, ...rest] = process.env.GITHUB_REPOSITORY?.split('/') ?? []

  if (!owner || !repo || rest.length > 0) {
    return raise(
      "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
    )
  }

  const node_id =
    event.payload.repository?.node_id ||
    raise('context.repo: no repo node_id in payload')

  return {owner, repo, node_id}
}

/**
 * For workflow_run, GitHub provides the source commit/branch in the payload
 * (`workflow_run.head_sha` and `workflow_run.head_branch`).
 *
 * We intentionally prefer those values over environment variables so
 * downstream deployment metadata and pull request comments point at the
 * workflow run head commit.
 *
 * For other events, continue using the standard env var fallback logic.
 *
 * @see https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_run
 * @see https://docs.github.com/en/actions/reference/variables-reference#default-environment-variables
 */
const getGitHubContextBranch = (event: WorkflowEvent): string => {
  if (event.eventName === 'workflow_run') {
    return event.payload.workflow_run.head_branch || raise('context: no branch')
  }
  return (
    process.env.GITHUB_HEAD_REF ||
    process.env.GITHUB_REF_NAME ||
    raise('context: no branch')
  )
}

/** A full commit SHA, as `GITHUB_SHA` and a payload's `head_sha` always are. */
const COMMIT_SHA = /^[0-9a-f]{40}$/

const getGitHubContextSha = (event: WorkflowEvent): string => {
  const sha =
    event.eventName === 'workflow_run'
      ? event.payload.workflow_run.head_sha
      : process.env.GITHUB_SHA
  if (!COMMIT_SHA.test(sha)) {
    return raise(`context: '${sha}' is not a commit sha`)
  }
  return sha
}

/**
 * Keep ref aligned with branch for workflow_run so this action resolves
 * a consistent source branch/commit pair for deployments and comments.
 *
 * @see https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_run
 */
const getGitHubContextRef = (event: WorkflowEvent): string => {
  if (event.eventName === 'workflow_run') {
    return (
      event.payload.workflow_run.head_branch ??
      raise('context: no head_branch in workflow_run event')
    )
  }
  if (process.env.GITHUB_HEAD_REF) {
    return process.env.GITHUB_HEAD_REF
  }
  // `push`: `refs/heads/feature-branch-1`. `pull_request`: the head's short
  // name, `andykenward/issue18`.
  if (event.payload.ref) {
    return event.payload.ref
  }
  if (event.eventName === 'pull_request') {
    return event.payload.pull_request.head.ref || raise('context: no ref')
  }
  return raise('context: no ref')
}

const getGitHubContext = (): GitHubContextShape => {
  const event = getWorkflowEvent()

  // Set on every runner; the fallback is for running the built action locally.
  const graphqlEndpoint =
    process.env.GITHUB_GRAPHQL_URL || 'https://api.github.com/graphql'
  const apiUrl = process.env.GITHUB_API_URL || 'https://api.github.com'

  const context = {
    event,
    repo: getGitHubContextRepo(event),
    branch: getGitHubContextBranch(event),
    sha: getGitHubContextSha(event),
    graphqlEndpoint,
    apiUrl,
    ref: getGitHubContextRef(event)
  }
  // Each field was checked where it was read; this pairs those checks.
  assert.ok(context.repo.owner.length > 0)
  assert.ok(context.branch.length > 0)
  assert.match(context.sha, COMMIT_SHA)
  assert.ok(URL.canParse(context.apiUrl))
  assert.ok(URL.canParse(context.graphqlEndpoint))

  if (isDebug()) {
    const debugContext = {
      ...context,
      event: 'will debug itself as output is large'
    }

    debug(`context: ${JSON.stringify(debugContext)}`)
  }

  return context
}

// oxlint-disable-next-line unicorn/throw-new-error
class GitHubContextError extends Schema.TaggedError<GitHubContextError>()(
  'GitHubContextError',
  {
    message: Schema.String,
    cause: Schema.Defect()
  }
) {
  static readonly from = (cause: unknown): GitHubContextError =>
    new GitHubContextError({message: errorMessage(cause), cause})
}

/**
 * The workflow run: its event payload, repository, branch and commit, read
 * from the runner's `GITHUB_*` environment variables once per run.
 */
export class GitHubContext extends Context.Service<
  GitHubContext,
  GitHubContextShape
>()('github-actions-cloudflare-pages/common/github/context/GitHubContext') {
  static readonly layer = Layer.effect(
    GitHubContext,
    Effect.try({
      try: () => GitHubContext.of(getGitHubContext()),
      catch: GitHubContextError.from
    })
  )
}
