import {debug, isDebug} from '@actions/core'
import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {describe, expect, onTestFinished, vi} from 'vitest'

import {GitHubContext} from '@/common/github/context.js'
import {stubTestEnvVars} from '@/tests/helpers/env.js'

vi.mock(import('@actions/core'))

/** Builds the layer when run, so env stubbed beforehand is picked up. */
const context = Effect.gen(function* () {
  return yield* GitHubContext
}).pipe(Effect.provide(GitHubContext.layer))

describe(GitHubContext, () => {
  it.effect('returns context for `pull_request`', () =>
    Effect.gen(function* () {
      expect.assertions(6)

      const {repo, event, branch, sha, graphqlEndpoint, ref} = yield* context

      /** Repo */
      expect(repo).toMatchInlineSnapshot(`
        {
          "node_id": "MDEwOlJlcG9zaXRvcnkxODY4NTMwMDI=",
          "owner": "andykenward",
          "repo": "github-actions-cloudflare-pages",
        }
      `)

      /** Event */
      expect(event.eventName).toBe('pull_request')

      expect(branch).toBe(`mock-github-head-ref`)
      expect(sha).toBe(`mock-github-sha`)
      expect(graphqlEndpoint).toBe(`https://api.github.com/graphql`)
      expect(ref).toBe(`mock-github-head-ref`)
    })
  )

  it.effect('returns context for `workflow_dispatch`', () =>
    Effect.gen(function* () {
      expect.assertions(6)

      stubTestEnvVars('workflow_dispatch')

      vi.stubEnv('GITHUB_HEAD_REF', '')

      const {repo, event, branch, sha, graphqlEndpoint, ref} = yield* context

      expect(repo).toStrictEqual({
        node_id: 'MDEwOlJlcG9zaXRvcnkxNzI3MzA1MQ==',
        owner: 'andykenward',
        repo: 'github-actions-cloudflare-pages'
      })

      expect(event.eventName).toBe('workflow_dispatch')

      expect(branch).toBe(`mock-github-ref-name`)
      expect(sha).toBe(`mock-github-sha`)
      expect(graphqlEndpoint).toBe(`https://api.github.com/graphql`)
      expect(ref).toBe(`refs/heads/master`)
    })
  )

  it.effect('fails when GITHUB_REPOSITORY has no owner', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      vi.stubEnv('GITHUB_REPOSITORY', '/repo')

      const error = yield* Effect.flip(context)

      expect(error.message).toBe(
        "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
      )
    })
  )

  it.effect('fails when GITHUB_REPOSITORY has no slash', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      vi.stubEnv('GITHUB_REPOSITORY', 'noslash')

      const error = yield* Effect.flip(context)

      expect(error.message).toBe(
        "context.repo: requires a GITHUB_REPOSITORY environment variable like 'owner/repo'"
      )
    })
  )

  it.effect('returns context for `workflow_run`', () =>
    Effect.gen(function* () {
      expect.assertions(6)

      stubTestEnvVars('workflow_run')

      const {event, branch, sha, graphqlEndpoint, ref} = yield* context

      expect(event.payload).toBeDefined()
      expect(event.eventName).toBe('workflow_run')

      expect(branch).toBe('master')
      expect(sha).toBe('3484a3fb816e0859fd6e1cea078d76385ff50625')
      expect(graphqlEndpoint).toBe(`https://api.github.com/graphql`)
      expect(ref).toBe('master')
    })
  )

  it.effect(
    'takes the ref of a `pull_request` from its payload without GITHUB_HEAD_REF',
    () =>
      Effect.gen(function* () {
        expect.assertions(2)

        vi.stubEnv('GITHUB_HEAD_REF', '')

        const {branch, ref} = yield* context

        // The pull request's `head.ref` in the payload fixture.
        expect(ref).toBe('changes')
        expect(branch).toBe('mock-github-ref-name')
      })
  )

  it.effect(
    'logs the context but not the event with step debug logging on',
    () =>
      Effect.gen(function* () {
        expect.assertions(1)

        vi.mocked(isDebug).mockReturnValue(true)
        onTestFinished(() => {
          vi.mocked(isDebug).mockReturnValue(false)
        })

        const {repo, branch, sha, graphqlEndpoint, ref} = yield* context

        expect(debug).toHaveBeenCalledWith(
          `context: ${JSON.stringify({
            event: 'will debug itself as output is large',
            repo,
            branch,
            sha,
            graphqlEndpoint,
            ref
          })}`
        )
      })
  )
})
