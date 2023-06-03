import {existsSync, readFileSync} from 'node:fs'
import {EOL} from 'node:os'

import type {WebhookEventMap, WebhookEventName} from '@octokit/webhooks-types'

export const getGitHubContext = () => {
  const eventName = process.env.GITHUB_EVENT_NAME as WebhookEventName

  switch (eventName) {
    case 'pull_request': {
      return {
        eventName,
        payload: getPayload<typeof eventName>()
      }
    }
    default: {
      return {
        eventName,
        payload: getPayload<typeof eventName>()
      }
    }
  }
}

const getPayload = <E extends WebhookEventName>():
  | WebhookEventMap[E]
  | undefined => {
  let payload

  if (process.env.GITHUB_EVENT_PATH) {
    if (existsSync(process.env.GITHUB_EVENT_PATH)) {
      payload = JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, {encoding: 'utf8'})
      ) as WebhookEventMap[E]
    } else {
      const path = process.env.GITHUB_EVENT_PATH
      process.stdout.write(`GITHUB_EVENT_PATH ${path} does not exist${EOL}`)
      // Do we need to fail if no payload?
    }
  }

  return payload
}
