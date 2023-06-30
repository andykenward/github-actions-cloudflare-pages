import {describe, expect, test} from 'vitest'

import {useContext} from '@/src/github/context.js'

describe('getGitHubContext', () => {
  test('returns eventName ', () => {
    const {repo, event, branch, sha, graphqlEndpoint, ref} = useContext()

    /** Repo */
    expect(repo).toMatchInlineSnapshot(`
      {
        "id": "MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=",
        "owner": "unlike-ltd",
        "repo": "github-actions-cloudflare-pages",
      }
    `)

    /** Event */
    expect(event.payload).not.toBeUndefined()
    expect(event.payload).toMatchSnapshot()
    expect(event.eventName).toStrictEqual('pull_request')

    expect(branch).toStrictEqual(`mock-github-head-ref`)
    expect(sha).toStrictEqual(`mock-github-sha`)
    expect(graphqlEndpoint).toStrictEqual(`https://api.github.com/graphql`)
    expect(ref).toStrictEqual(`mock-github-ref`)
  })
})
