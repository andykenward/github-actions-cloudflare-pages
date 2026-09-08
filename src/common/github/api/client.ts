import type {GraphQLError} from 'graphql'

import type {TypedDocumentString} from '@/gql/graphql.js'

import {secret, useCommonInputs} from '@/common/inputs.js'

import {useContext} from '../context.js'

/**
 * https://github.com/octokit/graphql.js/blob/c067d9c5da27e0147d25fa215192f1d8be7e1b72/src/types.ts#L55C1-L72C3
 */
export type GitHubGraphQLError = Partial<GraphQLError> & {
  /**
   * NOT_FOUND
   */
  type: string
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

export const request = async <
  TData = unknown,
  TVariables extends Variables = Variables
>(
  params: RequestParams<TData, TVariables>
): Promise<GraphqlResponse<TData>> => {
  const {query, variables, options} = params
  const {errorThrows} = options || {errorThrows: true}
  const {gitHubApiToken} = useCommonInputs()
  const {graphqlEndpoint} = useContext()

  const response = await fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      authorization: `bearer ${secret(gitHubApiToken)}`,
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
