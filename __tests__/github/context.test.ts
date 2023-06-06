import {describe, expect, test} from 'vitest'

import {useContext} from '@/src/github/context.js'

describe('getGitHubContext', () => {
  test('returns eventName ', () => {
    process.env.GITHUB_EVENT_NAME = 'pull_request'
    process.env.GITHUB_REPOSITORY = 'unlike-ltd/cloudflare-pages-action'
    process.env.GITHUB_EVENT_PATH =
      'payload-examples/api.github.com/pull_request/opened.payload.json'

    expect.assertions(5)

    const context = useContext()

    expect(context.event.eventName).toBe('pull_request')
    expect(context.repo).toMatchInlineSnapshot(`
      {
        "owner": "unlike-ltd",
        "repo": "cloudflare-pages-action",
      }
    `)

    expect(context.event.payload).not.toBeUndefined()
    expect(context.event.payload).toMatchSnapshot()

    expect(context.event.eventName).toStrictEqual('pull_request')
  })
})
