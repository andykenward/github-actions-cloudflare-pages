import {getWorkflowEvent} from './workflow-event/workflow-event.js'

type Context = {
  event: ReturnType<typeof getWorkflowEvent>
  repo: {owner: string; repo: string}
}

const getGitHubContext = (): Context => {
  const event = getWorkflowEvent()
  const repo = getRepo()

  return {
    event,
    repo
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
