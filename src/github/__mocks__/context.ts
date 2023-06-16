import {vi} from 'vitest'

import PAYLOAD from '@/payloads/api.github.com/pull_request/opened.payload.json'

import type {WorkflowEventExtract} from '../workflow-event/types.js'
import * as Context from '../context.js'

process.env.GITHUB_EVENT_NAME = 'pull_request'
process.env.GITHUB_REPOSITORY = 'unlike-ltd/cloudflare-pages-action'
process.env.GITHUB_EVENT_PATH =
  'payload-examples/api.github.com/pull_request/opened.payload.json'

export const useContext = vi
  .fn<never, ReturnType<typeof Context.useContext>>()
  .mockReturnValue({
    event: {
      eventName: 'pull_request',
      payload: PAYLOAD
    } as WorkflowEventExtract<'pull_request'>,
    repo: {
      owner: 'unlike-ltd',
      repo: 'cloudflare-pages-action'
    }
  })

export const useContextEvent = vi
  .fn<never, ReturnType<typeof Context.useContextEvent>>()
  .mockReturnValue(Context.useContext().event)
