import type {GraphQLError} from 'graphql'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'

import type {TypedDocumentString} from '@/gql/graphql.js'

import {errorMessage} from '@/common/errors.js'
import {CommonInputs, secret} from '@/common/inputs.js'

import {GitHubContext} from '../context.js'

/**
 * https://github.com/octokit/graphql.js/blob/c067d9c5da27e0147d25fa215192f1d8be7e1b72/src/types.ts#L55C1-L72C3
 */
export type GitHubGraphQLError = Partial<GraphQLError> & {
  /**
   * e.g. NOT_FOUND. Absent on a static validation error, whose `path` starts
   * with the operation (`mutation Name`) rather than a field.
   */
  type?: string
}

export type GraphqlResponse<T = unknown> = {
  data: T
  errors?: GitHubGraphQLError[]
}
export type Variables = Record<string, unknown>

type Options = {
  /**
   * Should request throw error when graphql returns errors
   * Default is true
   */
  errorThrows?: boolean
}

// | string
// | DocumentNode
// | TypedDocumentNode<TData, TVariables>

export type RequestParams<TData, TVariables> = {
  query: string | TypedDocumentString<TData, TVariables>
  variables?: TVariables
  options?: Options
}

// oxlint-disable-next-line unicorn/throw-new-error
export class GitHubApiError extends Schema.TaggedError<GitHubApiError>()(
  'GitHubApiError',
  {
    message: Schema.String,
    cause: Schema.Defect()
  }
) {
  static readonly from = (cause: unknown): GitHubApiError =>
    new GitHubApiError({message: errorMessage(cause), cause})
}

const fetchGraphql = async <TData, TVariables extends Variables>(
  endpoint: string,
  token: string,
  {query, variables, options}: RequestParams<TData, TVariables>
): Promise<GraphqlResponse<TData>> => {
  // `options || {errorThrows: true}` let `options: {}` silently disable it.
  const errorThrows = options?.errorThrows ?? true

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.flash-preview+json'
    },
    body: JSON.stringify({query: query.toString(), variables})
  })

  /**
   * GraphQL reports query-level problems as a 200 with an `errors` array, so a
   * non-2xx here is a transport, auth or rate-limit failure. It was previously
   * unchecked: GitHub returns JSON for a 401, which parsed cleanly, carried no
   * `errors` field, and silently yielded `data: undefined`.
   */
  if (!response.ok) {
    throw new Error(
      `GitHub API request failed: ${response.status} ${response.statusText}`
    )
  }

  const body = (await response.json().catch(() => {
    throw new Error(
      `GitHub API returned a non-JSON response (${response.status})`
    )
  })) as GraphqlResponse<TData>

  if (body.errors && errorThrows) {
    throw new Error(JSON.stringify(body.errors))
  }

  return body
}

/**
 * The GitHub GraphQL API, authenticated with the `github-token` input. The
 * token and endpoint are read once, when the layer is built. The one REST call
 * (listing deployments) is `GitHubRestApi` in `paginate.ts`.
 */
export class GitHubApi extends Context.Service<
  GitHubApi,
  {
    /**
     * Fails on a non-2xx response and, unless `options.errorThrows` is
     * `false`, on a GraphQL `errors` array.
     */
    request<TData = unknown, TVariables extends Variables = Variables>(
      params: RequestParams<TData, TVariables>
    ): Effect.Effect<GraphqlResponse<TData>, GitHubApiError>
  }
>()('github-actions-cloudflare-pages/common/github/api/client/GitHubApi') {
  static readonly layer = Layer.effect(
    GitHubApi,
    Effect.gen(function* () {
      const {gitHubApiToken} = yield* CommonInputs
      const {graphqlEndpoint} = yield* GitHubContext

      return GitHubApi.of({
        request: params =>
          Effect.tryPromise({
            try: () =>
              fetchGraphql(graphqlEndpoint, secret(gitHubApiToken), params),
            catch: GitHubApiError.from
          })
      })
    })
  )
}
