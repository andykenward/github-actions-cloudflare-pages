import {describe, expect, test} from 'vitest'

import {useContext} from '@/common/github/context.js'

describe('getGitHubContext', () => {
  test('returns eventName ', () => {
    expect.assertions(8)

    const {repo, event, branch, sha, graphqlEndpoint, ref} = useContext()

    /** Repo */
    expect(repo).toMatchInlineSnapshot(`
      {
        "node_id": "MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=",
        "owner": "andykenward",
        "repo": "github-actions-cloudflare-pages",
      }
    `)

    /** Event */
    expect(event.payload).toBeDefined()
    expect(event.payload).toMatchSnapshot()
    expect(event.eventName).toBe('pull_request')

    expect(branch).toBe(`mock-github-head-ref`)
    expect(sha).toBe(`mock-github-sha`)
    expect(graphqlEndpoint).toBe(`https://api.github.com/graphql`)
    expect(ref).toBe(`mock-github-head-ref`)
  })
})
