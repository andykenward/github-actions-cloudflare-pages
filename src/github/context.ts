import {getWorkflowEvent} from './workflow-event/workflow-event.js'

type Context = {
  /**
   * The event that triggered the workflow run.
   */
  event: ReturnType<typeof getWorkflowEvent>
  repo: {owner: string; repo: string}
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
}

const getGitHubContext = (): Context => {
  const event = getWorkflowEvent()
  const repo = getRepo()

  /**
   * Depending on what event triggers the action.
   * The GITHUB_HEAD_REF may be undefined so we fallback to GITHUB_REF_NAME.
   */
  const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME

  const sha = process.env.GITHUB_SHA

  return {
    event,
    repo,
    branch,
    sha
  }
}

const getRepo = (): Context['repo'] => {
  if (process.env.GITHUB_REPOSITORY) {
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split('/')
    if (owner === undefined || repo === undefined) {
      throw new Error('no repo')
    }
    return {owner, repo}
  }

  throw new Error(
    "context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
  )
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
