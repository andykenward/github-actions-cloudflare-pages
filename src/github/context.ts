import {existsSync, readFileSync} from 'node:fs'
import {EOL} from 'node:os'

import {type Context} from './generated/event-names.js'

type EventName = Context['eventName']

type Extra = {
  repo: {owner: string; repo: string}
}

export type ContextE<E extends EventName> = Extract<
  Context,
  Record<'eventName', E>
> &
  Extra

export type Payload<E extends EventName> = Extract<
  Context,
  Record<'eventName', E>
>['payload']

export const getGitHubContext = () => {
  const eventName = process.env.GITHUB_EVENT_NAME as EventName
  const payload = getPayload()
  const repo = getRepo()

  return {
    eventName,
    payload,
    repo
  } as ContextE<typeof eventName>
}

const getRepo = (): Extra['repo'] => {
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

const getPayload = () => {
  if (process.env.GITHUB_EVENT_PATH) {
    if (existsSync(process.env.GITHUB_EVENT_PATH)) {
      return JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, {encoding: 'utf8'})
      ) as unknown
    } else {
      const path = process.env.GITHUB_EVENT_PATH
      process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL}`)
    }
  }
}
type ContextR = ReturnType<typeof getGitHubContext>

let _context: ContextR
export const useContext = (): ContextR => {
  if (!_context) {
    _context = getGitHubContext()
  }
  return _context
}
