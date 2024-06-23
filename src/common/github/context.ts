/* eslint-disable no-console */

import {debug, isDebug} from '@actions/core'

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

interface Context {
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

const getGitHubContext = (): Context => {
  const event = getWorkflowEvent()

  const repo = ((): Repo => {
    const [owner, repo] = process.env.GITHUB_REPOSITORY
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
   * Depending on what event triggers the action.
   * The GITHUB_HEAD_REF may be undefined so we fallback to GITHUB_REF_NAME.
   */
  const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME

  const sha = process.env.GITHUB_SHA

  const graphqlEndpoint = process.env.GITHUB_GRAPHQL_URL

  const ref = ((): Context['ref'] => {
    let ref = process.env.GITHUB_HEAD_REF
    if (!ref) {
      if ('ref' in event.payload) {
        ref = event.payload.ref // refs/heads/feature-branch-1
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

type UseContext = ReturnType<typeof getGitHubContext>

let _context: UseContext
export const useContext = (): UseContext => {
  return _context ?? (_context = getGitHubContext())
}

export const useContextEvent = (): UseContext['event'] => useContext().event
