import {beforeEach, describe, expect, test, vi} from 'vitest'

describe('getGitHubContext', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('returns eventName ', async () => {
    expect.assertions(8)

    const {useContext} = await import('@/common/github/context.js')

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
