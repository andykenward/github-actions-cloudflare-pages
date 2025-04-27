import {beforeEach, describe, expect, test, vi} from 'vitest'

import {stubTestEnvVars} from '@/tests/helpers/env.js'

describe('useContext', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  test('returns context for `pull_request`', async () => {
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

  test('returns context for `workflow_dispatch`', async () => {
    expect.assertions(8)

    stubTestEnvVars('workflow_dispatch')

    vi.stubEnv('GITHUB_HEAD_REF', '')

    const {useContext} = await import('@/common/github/context.js')

    const {repo, event, branch, sha, graphqlEndpoint, ref} = useContext()

    expect(repo).toStrictEqual({
      node_id: 'MDEwOlJlcG9zaXRvcnkxNzI3MzA1MQ==',
      owner: 'andykenward',
      repo: 'github-actions-cloudflare-pages'
    })

    expect(event.payload).toBeDefined()
    expect(event.payload).toMatchSnapshot()
    expect(event.eventName).toBe('workflow_dispatch')

    expect(branch).toBe(`mock-github-ref-name`)
    expect(sha).toBe(`mock-github-sha`)
    expect(graphqlEndpoint).toBe(`https://api.github.com/graphql`)
    expect(ref).toBe(`refs/heads/master`)

    vi.unstubAllEnvs()
  })
})
