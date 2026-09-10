import {debug, isDebug} from '@actions/core'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import {errorMessage} from '../errors.js'
import {raise} from '../utils.js'
import {getWorkflowEvent} from './workflow-event/workflow-event.js'

interface Repo {
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
  event: ReturnType<typeof getWorkflowEvent>
  repo: Repo
  /**
   * The branch or tag ref that triggered the workflow run.
   */
  branch?: string
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
   * refs/heads/feature-branch-1.
   */
  ref: string
}

const getGitHubContext = (): GitHubContextShape => {
  const event = getWorkflowEvent()

  const repo = ((): Repo => {
    const [
      owner = raise(
        "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
      ),
      repo = raise(
        "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
      )
    ] = process.env.GITHUB_REPOSITORY
      ? process.env.GITHUB_REPOSITORY.split('/')
      : raise(
          "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
        )

    const node_id =
      'repository' in event.payload
        ? event.payload.repository?.node_id ||
          raise('context.repo: no repo node_id in payload')
        : raise('context.repo: no repo node_id in payload')

    return {owner, repo, node_id}
  })()

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
  const branch =
    event.eventName === 'workflow_run'
      ? (event.payload.workflow_run.head_branch ?? undefined)
      : process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME

  const sha =
    event.eventName === 'workflow_run'
      ? event.payload.workflow_run.head_sha
      : process.env.GITHUB_SHA

  const graphqlEndpoint = process.env.GITHUB_GRAPHQL_URL

  const ref = ((): GitHubContextShape['ref'] => {
    /**
     * Keep ref aligned with branch for workflow_run so this action resolves
     * a consistent source branch/commit pair for deployments and comments.
     *
     * @see https://docs.github.com/en/webhooks/webhook-events-and-payloads#workflow_run
     */
    if (event.eventName === 'workflow_run') {
      return (
        event.payload.workflow_run.head_branch ??
        raise('context: no head_branch in workflow_run event')
      )
    }

    let ref = process.env.GITHUB_HEAD_REF
    if (!ref) {
      if ('ref' in event.payload) {
        ref = event.payload.ref ?? undefined // refs/heads/feature-branch-1
      } else if (event.eventName === 'pull_request') {
        ref = event.payload.pull_request.head.ref // andykenward/issue18
      }
      if (!ref) return raise('context: no ref')
    }
    return ref
  })()

  const context = {
    event,
    repo,
    branch,
    sha,
    graphqlEndpoint,
    ref
  }

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
) {}

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
      catch: cause =>
        new GitHubContextError({message: errorMessage(cause), cause})
    })
  )
}
