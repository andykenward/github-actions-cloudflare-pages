import type {GraphQLError} from 'graphql'

import {getInput} from '@unlike/github-actions-core'

import type {TypedDocumentString} from '@/gql/graphql.js'
import {ACTION_INPUT_GITHUB_TOKEN} from '@/src/constants.js'

import {useContext} from '../context.js'

/**
 * https://github.com/octokit/graphql.js/blob/c067d9c5da27e0147d25fa215192f1d8be7e1b72/src/types.ts#L55C1-L72C3
 */
export type GitHubGraphQLError = Partial<GraphQLError> & {
  type: string | 'NOT_FOUND'
}

export type GraphqlResponse<T = unknown> = {
  data: T
  errors?: GitHubGraphQLError[]
}
type Variables = Record<string, unknown>

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

export const request = async <
  TData = unknown,
  TVariables extends Variables = Variables
>(
  query: string | TypedDocumentString<TData, TVariables>,
  variables: TVariables = Object.create(null),
  options?: Options
): Promise<GraphqlResponse<TData>> => {
  const {errorThrows} = {errorThrows: true, ...options}
  const token = getInput(ACTION_INPUT_GITHUB_TOKEN, {required: true})

  const {graphqlEndpoint} = useContext()

  return fetch(graphqlEndpoint, {
    method: 'POST',
    headers: {
      authorization: `bearer ${token}`,
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
