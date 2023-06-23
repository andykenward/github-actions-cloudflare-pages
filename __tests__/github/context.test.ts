import {describe, expect, test} from 'vitest'

import {useContext} from '@/src/github/context.js'

describe('getGitHubContext', () => {
  test('returns eventName ', () => {
    const {repo, event, branch, sha} = useContext()

    /** Repo */
    expect(repo).toMatchInlineSnapshot(`
      {
        "owner": "mock-owner",
        "repo": "mock-github-repository",
      }
    `)

    /** Event */
    expect(event.payload).not.toBeUndefined()
    expect(event.payload).toMatchSnapshot()
    expect(event.eventName).toStrictEqual('pull_request')

    expect(branch).toStrictEqual(`mock-github-head-ref`)
    expect(sha).toStrictEqual(`mock-github-sha`)
  })
})
