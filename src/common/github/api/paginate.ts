import type {PaginatingEndpoints} from '@octokit/plugin-paginate-rest'

import {Octokit} from '@octokit-next/core'
import {paginateRest} from '@octokit/plugin-paginate-rest'
import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import {CommonInputs, secret} from '@/common/inputs.js'

import {GitHubApiError} from './client.js'

/**
 * @see {@link https://github.com/octokit/plugin-paginate-rest.js/blob/44d8b933b8fb495fb7b8d95661452f23b482ea55/src/types.ts#L55}
 */
type DataType<T> = 'data' extends keyof T ? T['data'] : unknown

export type PaginateResponse<T extends keyof PaginatingEndpoints> = DataType<
  PaginatingEndpoints[T]['response']
>

const paginate = async <T extends keyof PaginatingEndpoints>(
  token: string,
  endpoint: T,
  options: PaginatingEndpoints[T]['parameters']
): Promise<PaginateResponse<T>> =>
  // TODO:@andykenward #32 fix types in @octokit-next/core or @octokit/plugin-paginate-rest . Can then remove the ts-expect-error & as Promise<PaginateResponse<T>>
  // oxlint-disable-next-line typescript/ban-ts-comment
  // @ts-expect-error
  new (Octokit.withPlugins([paginateRest]))({
    auth: token
  })['paginate'](endpoint, options) as Promise<PaginateResponse<T>>

/**
 * GitHub's REST API, for the one call that is not GraphQL: listing
 * deployments. Kept apart from `GitHubApi` so that Octokit is bundled only
 * into the delete action, the one action that provides this layer.
 */
export class GitHubRestApi extends Context.Service<
  GitHubRestApi,
  {
    paginate<T extends keyof PaginatingEndpoints>(
      endpoint: T,
      options: PaginatingEndpoints[T]['parameters']
    ): Effect.Effect<PaginateResponse<T>, GitHubApiError>
  }
>()(
  'github-actions-cloudflare-pages/common/github/api/paginate/GitHubRestApi'
) {
  static readonly layer = Layer.effect(
    GitHubRestApi,
    Effect.gen(function* () {
      const {gitHubApiToken} = yield* CommonInputs

      return GitHubRestApi.of({
        paginate: (endpoint, options) =>
          Effect.tryPromise({
            try: () => paginate(secret(gitHubApiToken), endpoint, options),
            catch: GitHubApiError.from
          })
      })
    })
  )
}
