import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'

import type {RecentDeployment} from '@/common/github/deployment/recent.js'
import type {MockApi} from '@/tests/helpers/api.js'

import {
  getRecentDeployments,
  isNewestDeployment,
  previousCommentId
} from '@/common/github/deployment/recent.js'
import {CommonLayer} from '@/common/layer.js'
import {
  DeploymentStatusState,
  GetRecentDeploymentsDocument
} from '@/gql/graphql.js'
import {setMockApi} from '@/tests/helpers/api.js'

vi.mock(import('@actions/core'))

/** The branch `GITHUB_HEAD_REF` names in the test env. */
const BRANCH = 'mock-github-head-ref'

const node = (
  id: string,
  branch: string | undefined,
  payload: string | null = null
): RecentDeployment => ({
  id,
  createdAt: '2026-11-22T10:00:00Z',
  payload,
  ref: branch === undefined ? null : {id: `REF_${branch}`, name: branch},
  commit: {id: 'C_1', oid: 'ffac537e6cbbf934b08745a378932722df287a53'},
  latestStatus: {
    id: 'DS_1',
    state: DeploymentStatusState.InProgress,
    description: null,
    logUrl: null
  }
})

describe('recent deployments', () => {
  let mockApi: MockApi

  /** Answers the query with `nodes`, newest first. */
  const interceptRecent = (nodes: Array<RecentDeployment | null>) =>
    mockApi.interceptGithub(
      {
        query: GetRecentDeploymentsDocument,
        variables: {
          owner: 'andykenward',
          repo: 'github-actions-cloudflare-pages',
          environment: 'preview'
        }
      },
      {data: {repository: {deployments: {nodes}}}}
    )

  beforeEach(() => {
    mockApi = setMockApi()
  })

  afterEach(async () => {
    mockApi.mockAgent.assertNoPendingInterceptors()
    await mockApi.mockAgent.close()
  })

  // oxlint-disable-next-line vitest/prefer-describe-function-title
  describe('getRecentDeployments', () => {
    it.effect('keeps only the context branch, in order', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        interceptRecent([
          node('DE_3', BRANCH),
          null,
          node('DE_2', 'other'),
          // The branch was deleted.
          // oxlint-disable-next-line unicorn/no-useless-undefined
          node('DE_1', undefined),
          node('DE_0', BRANCH)
        ])

        const deployments = yield* getRecentDeployments('preview')

        expect(deployments.map(({id}) => id)).toStrictEqual(['DE_3', 'DE_0'])
      }).pipe(Effect.provide(CommonLayer))
    )
  })

  // oxlint-disable-next-line vitest/prefer-describe-function-title
  describe('isNewestDeployment', () => {
    it.effect.each([
      {name: 'the newest', id: 'DE_3', expected: true},
      {name: 'older than another', id: 'DE_0', expected: false},
      {name: 'not listed yet', id: 'DE_4', expected: true}
    ])('is $expected for a deployment $name', ({id, expected}) =>
      Effect.gen(function* () {
        expect.assertions(1)

        interceptRecent([node('DE_3', BRANCH), node('DE_0', BRANCH)])

        expect(yield* isNewestDeployment(id, 'preview')).toBe(expected)
      }).pipe(Effect.provide(CommonLayer))
    )
  })
})

/** A payload as GraphQL returns it: the stored JSON, encoded again. */
const graphqlPayload = (payload: object): string =>
  JSON.stringify(JSON.stringify(payload))

describe(previousCommentId, () => {
  test('takes the newest deployment that recorded a comment', () => {
    expect.assertions(1)

    expect(
      previousCommentId([
        node('DE_3', BRANCH),
        node('DE_2', BRANCH, '{not json'),
        node(
          'DE_1',
          BRANCH,
          graphqlPayload({version: 3, commentId: 'IC_1', cloudflare: {}})
        ),
        node(
          'DE_0',
          BRANCH,
          graphqlPayload({url: 'x', commentId: 'IC_0', cloudflareId: 'y'})
        )
      ])
    ).toBe('IC_1')
  })

  test('finds none when no deployment recorded one', () => {
    expect.assertions(1)

    expect(
      previousCommentId([node('DE_1', BRANCH, graphqlPayload({url: 'x'}))])
    ).toBeUndefined()
  })
})
