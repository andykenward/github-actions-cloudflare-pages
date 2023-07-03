/* eslint-disable no-console */

import {getWorkflowEvent} from './workflow-event/workflow-event.js'

interface Context {
  /**
   * The event that triggered the workflow run.
   */
  event: ReturnType<typeof getWorkflowEvent>
  repo: {owner: string; repo: string; id: string}
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

  // refId: string
}

const getGitHubContext = (): Context => {
  const event = getWorkflowEvent()

  const repo = ((): Context['repo'] => {
    if (process.env.GITHUB_REPOSITORY) {
      const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')

      if (owner === undefined || repo === undefined) {
        throw new Error('no repo')
      }

      let id
      if ('repository' in event.payload) {
        id = event.payload.repository?.node_id
      }
      if (!id) {
        throw new Error('context.repo no repo id in payload')
      }
      return {owner, repo, id}
    }

    throw new Error(
      "context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
    )
  })()

  /**
   * Depending on what event triggers the action.
   * The GITHUB_HEAD_REF may be undefined so we fallback to GITHUB_REF_NAME.
   */
  const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME

  const sha = process.env.GITHUB_SHA

  const ref = branch || process.env.GITHUB_REF

  const graphqlEndpoint = process.env.GITHUB_GRAPHQL_URL

  // let refId
  // if (event.eventName === 'pull_request') {
  //   refId = event.payload.pull_request.node_id
  // }
  // if (event.eventName === 'push') {
  //   refId = event.payload.
  // }

  console.log('GITHUB_HEAD_RED:', process.env.GITHUB_HEAD_REF)
  console.log('GITHUB_REF_NAME:', process.env.GITHUB_REF_NAME)
  console.log('GITHUB_REF:', process.env.GITHUB_REF)
  console.log('BRANCH', branch)
  console.log('REF', ref)
  // eslint-disable-next-line unicorn/no-null
  console.dir(event.payload, {depth: null})

  return {
    event,
    repo,
    branch,
    sha,
    graphqlEndpoint,
    ref
    // refId
  }
}

type UseContext = ReturnType<typeof getGitHubContext>

let _context: UseContext
export const useContext = (): UseContext => {
  if (!_context) {
    _context = getGitHubContext()
  }
  return _context
}

export const useContextEvent = (): UseContext['event'] => useContext().event
