import {strict as assert} from 'node:assert'

import {describe, expect, test} from 'vitest'

import {useContext} from '../../github/context.js'

describe('getGitHubContext', () => {
  test('returns eventName ', () => {
    process.env.GITHUB_EVENT_NAME = 'pull_request'
    process.env.GITHUB_REPOSITORY = 'unlike-ltd/cloudflare-pages-action'
    process.env.GITHUB_EVENT_PATH =
      'payload-examples/api.github.com/pull_request/opened.payload.json'

    expect.assertions(4)

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

    assert.equal(context.event.eventName, 'pull_request')
  })
})
