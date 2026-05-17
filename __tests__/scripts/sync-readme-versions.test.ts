import {afterEach, beforeEach, describe, expect, test} from 'vitest'

import type {
  LatestReleaseQuery,
  LatestReleaseQueryVariables
} from '@/gql/graphql.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {setMockApi} from '@/tests/helpers/api.js'

import {
  getLatestRelease,
  QueryLatestRelease,
  replaceVersionReferences
} from '../../bin/sync-readme-versions.js'

const SHA = 'abc123def456abc123def456abc123def456abc1'
const VERSION = '3.4.0'
const VARIABLES = {
  owner: 'andykenward',
  repo: 'github-actions-cloudflare-pages'
} as const satisfies LatestReleaseQueryVariables

describe(replaceVersionReferences, () => {
  describe('main action', () => {
    test('replaces tag-only version', () => {
      expect(
        replaceVersionReferences(
          'uses: andykenward/github-actions-cloudflare-pages@v3.0.0',
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`
      )
    })

    test('replaces existing SHA+tag version', () => {
      expect(
        replaceVersionReferences(
          `uses: andykenward/github-actions-cloudflare-pages@oldsha123 #v2.0.0`,
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`
      )
    })

    test('replaces multiple occurrences', () => {
      const line = 'uses: andykenward/github-actions-cloudflare-pages@v3.0.0'
      expect(
        replaceVersionReferences([line, line].join('\n'), SHA, VERSION)
      ).toBe(
        [
          `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`,
          `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`
        ].join('\n')
      )
    })
  })

  describe('delete sub-action', () => {
    test('replaces tag-only version', () => {
      expect(
        replaceVersionReferences(
          'uses: andykenward/github-actions-cloudflare-pages/delete@v2.3.2',
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages/delete@${SHA} #v${VERSION}`
      )
    })

    test('replaces existing SHA+tag version', () => {
      expect(
        replaceVersionReferences(
          `uses: andykenward/github-actions-cloudflare-pages/delete@oldsha123 #v2.0.0`,
          SHA,
          VERSION
        )
      ).toBe(
        `uses: andykenward/github-actions-cloudflare-pages/delete@${SHA} #v${VERSION}`
      )
    })
  })

  test('replaces both main and delete references in the same content', () => {
    const content = [
      'uses: andykenward/github-actions-cloudflare-pages@v3.0.0',
      'uses: andykenward/github-actions-cloudflare-pages/delete@v2.3.2'
    ].join('\n')

    expect(replaceVersionReferences(content, SHA, VERSION)).toBe(
      [
        `uses: andykenward/github-actions-cloudflare-pages@${SHA} #v${VERSION}`,
        `uses: andykenward/github-actions-cloudflare-pages/delete@${SHA} #v${VERSION}`
      ].join('\n')
    )
  })

  test('delete reference is not partially matched by main pattern', () => {
    const result = replaceVersionReferences(
      'uses: andykenward/github-actions-cloudflare-pages/delete@v2.3.2',
      SHA,
      VERSION
    )
    expect(result).toContain('/delete@')
    expect(result).not.toMatch(/github-actions-cloudflare-pages@.*\/delete@/)
  })

  test('leaves content without action references unchanged', () => {
    const content = '# Just a README\nSome text without action references.'
    expect(replaceVersionReferences(content, SHA, VERSION)).toBe(content)
  })
})

describe(getLatestRelease, () => {
  let mockApi: MockApi

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  test('returns sha and version from GraphQL response', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {
        data: {
          repository: {
            latestRelease: {tagName: `v${VERSION}`, tagCommit: {oid: SHA}}
          }
        }
      }
    )

    await expect(getLatestRelease()).resolves.toStrictEqual({
      sha: SHA,
      version: VERSION
    })
  })

  test('strips v prefix from tagName', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {
        data: {
          repository: {
            latestRelease: {tagName: 'v1.2.3', tagCommit: {oid: SHA}}
          }
        }
      }
    )

    const {version} = await getLatestRelease()
    expect(version).toBe('1.2.3')
  })

  test('throws on non-ok HTTP response', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {data: {}},
      401
    )

    await expect(getLatestRelease()).rejects.toThrow(
      'GitHub API request failed: 401'
    )
  })

  test('throws when GraphQL errors are present', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {data: {}, errors: [{type: 'NOT_FOUND', message: 'Not found'}]}
    )

    await expect(getLatestRelease()).rejects.toThrow('GitHub API errors')
  })

  test('throws when repository is missing from response', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {data: {repository: null}}
    )

    await expect(getLatestRelease()).rejects.toThrow(
      'No repository in response'
    )
  })

  test('throws when latestRelease is missing from response', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {data: {repository: {latestRelease: null}}}
    )

    await expect(getLatestRelease()).rejects.toThrow(
      'No latestRelease in response'
    )
  })

  test('throws when tagCommit is missing from response', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {
        data: {
          repository: {latestRelease: {tagName: `v${VERSION}`, tagCommit: null}}
        }
      }
    )

    await expect(getLatestRelease()).rejects.toThrow(
      'No tagCommit in latest release'
    )
  })

  test('throws when SHA is not 40 characters', async () => {
    mockApi.interceptGithub<LatestReleaseQuery, LatestReleaseQueryVariables>(
      {query: QueryLatestRelease, variables: VARIABLES},
      {
        data: {
          repository: {
            latestRelease: {
              tagName: `v${VERSION}`,
              tagCommit: {oid: 'tooshort'}
            }
          }
        }
      }
    )

    await expect(getLatestRelease()).rejects.toThrow(
      'Expected full 40-char SHA'
    )
  })
})
