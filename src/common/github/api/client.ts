import type {GraphQLError} from 'graphql'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Predicate from 'effect/Predicate'
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

/**
 * `data` is absent when GitHub ran nothing — a rate limit, or a request it
 * rejected as invalid — which only an `errorThrows: false` caller sees.
 */
export type GraphqlResponse<T = unknown> = {
  data?: T | undefined
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

export type RequestParams<TData, TVariables> = {
  query: string | TypedDocumentString<TData, TVariables>
  variables?: TVariables
  options?: Options
}

/** GraphQL `errors` as one log line or message. */
export const formatGraphqlErrors = (
  errors: ReadonlyArray<GitHubGraphQLError>
): string => JSON.stringify(errors)

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

  /** The failure a GraphQL `errors` array reports. */
  static readonly fromGraphqlErrors = (
    errors: ReadonlyArray<GitHubGraphQLError>
  ): GitHubApiError =>
    new GitHubApiError({message: formatGraphqlErrors(errors), cause: errors})
}

/** An object whose `errors`, when present, is the array GraphQL specifies. */
const isGraphqlResponse = (body: unknown): body is GraphqlResponse =>
  Predicate.isObject(body) &&
  !Array.isArray(body) &&
  (!Predicate.hasProperty(body, 'errors') || Array.isArray(body.errors))

const fetchGraphql = async <TData, TVariables extends Variables>(
  endpoint: string,
  token: string,
  {query, variables}: RequestParams<TData, TVariables>,
  signal: AbortSignal
): Promise<GraphqlResponse<TData>> => {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.flash-preview+json'
    },
    body: JSON.stringify({query: query.toString(), variables}),
    signal
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

  const body: unknown = await response.json().catch((error: unknown) => {
    throw new Error(
      `GitHub API returned a non-JSON response (${response.status})`,
      {cause: error}
    )
  })

  if (!isGraphqlResponse(body)) {
    throw new Error('GitHub API returned an unexpected response shape')
  }
  // The wire shape is checked above; `data`'s type is the document's
  // compile-time contract, which is what the cast asserts.
  return body as GraphqlResponse<TData>
}

/**
 * The GitHub GraphQL API, authenticated with the `github-token` input. The
 * token and endpoint are read once, when the layer is built. The one REST call
 * (listing deployments) is `GitHubRestApi.paginate` in `paginate.ts`.
 */
export class GitHubApi extends Context.Service<
  GitHubApi,
  {
    /**
     * Fails on a non-2xx response and, unless `options.errorThrows` is
     * `false`, on a GraphQL `errors` array. Interrupting the effect aborts
     * the request.
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

      const request = Effect.fn('GitHubApi.request')(function* <
        TData,
        TVariables extends Variables
      >(params: RequestParams<TData, TVariables>) {
        const body = yield* Effect.tryPromise({
          try: signal =>
            fetchGraphql(
              graphqlEndpoint,
              secret(gitHubApiToken),
              params,
              signal
            ),
          catch: GitHubApiError.from
        })

        // `options || {errorThrows: true}` let `options: {}` silently disable it.
        const errorThrows = params.options?.errorThrows ?? true
        if (body.errors && errorThrows) {
          return yield* GitHubApiError.fromGraphqlErrors(body.errors)
        }
        return body
      })

      return GitHubApi.of({request})
    })
  )
}
