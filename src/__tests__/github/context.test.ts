import {strict as assert} from 'node:assert'

import {describe, expect, expectTypeOf, test} from 'vitest'

import {getGitHubContext, type ContextE} from '../../github/context.js'

describe('getGitHubContext', () => {
  test('returns eventName ', () => {
    process.env.GITHUB_EVENT_NAME = 'pull_request'
    process.env.GITHUB_REPOSITORY = 'unlike-ltd/cloudflare-pages-action'
    process.env.GITHUB_EVENT_PATH =
      'payload-examples/api.github.com/pull_request/opened.payload.json'

    expect.assertions(4)

    const context = getGitHubContext()

    expect(context.eventName).toBe('pull_request')
    expect(context.repo).toMatchInlineSnapshot(`
      {
        "owner": "unlike-ltd",
        "repo": "cloudflare-pages-action",
      }
    `)

    expect(context.payload).not.toBeUndefined()
    expect(context.payload).toMatchSnapshot()

    assert.equal(context.eventName, 'pull_request')
    expectTypeOf(context).toEqualTypeOf<ContextE<'pull_request'>>()
  })

  // test('throws error when repo not defined', () => {
  //   expect(() => getGitHubContext()).toThrow(
  //     `context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'`
  //   )
  // })

  // test('returns an empty payload if the GITHUB_EVENT_PATH environment variable is undefined', () => {
  //   delete process.env.GITHUB_EVENT_PATH

  //   context = new Context()
  //   expect(context.payload).toEqual({})
  // })
})
