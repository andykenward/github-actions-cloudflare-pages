import {vi} from 'vitest'

import PAYLOAD from '../../../payload-examples/api.github.com/pull_request/opened.payload.json'
import {type Payload} from '../context.js'

process.env.GITHUB_EVENT_NAME = 'pull_request'
process.env.GITHUB_REPOSITORY = 'unlike-ltd/cloudflare-pages-action'
process.env.GITHUB_EVENT_PATH =
  'payload-examples/api.github.com/pull_request/opened.payload.json'

export const useContext = vi.fn().mockReturnValue({
  eventName: 'pull_request',
  payload: PAYLOAD as Payload<'pull_request'>,
  repo: {
    owner: 'unlike-ltd',
    repo: 'cloudflare-pages-action'
  }
})
