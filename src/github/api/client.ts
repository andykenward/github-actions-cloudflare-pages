import type {GraphQLError} from 'graphql'

import type {TypedDocumentString} from '@/gql/graphql.js'
import {useInputs} from '@/src/inputs.js'

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
  const {gitHubApiToken} = useInputs()
  const {graphqlEndpoint} = useContext()

  return fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      authorization: `bearer ${gitHubApiToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.flash-preview+json'
    },
    body: JSON.stringify({query: query.toString(), variables})
  })
    .then(res => res.json() as Promise<GraphqlResponse<TData>>)
    .then(res => {
      if (res.errors && errorThrows) {
        throw new Error(JSON.stringify(res.errors))
      }
      return res
    })
}
