import type {PaginatingEndpoints} from '@octokit/plugin-paginate-rest'

import {Octokit} from '@octokit-next/core'
import {paginateRest} from '@octokit/plugin-paginate-rest'

import {useInputs} from '../../inputs.js'

/**
 * @see {@link https://github.com/octokit/plugin-paginate-rest.js/blob/44d8b933b8fb495fb7b8d95661452f23b482ea55/src/types.ts#L55}
 */
type DataType<T> = 'data' extends keyof T ? T['data'] : unknown

export type PaginateResponse<T extends keyof PaginatingEndpoints> = DataType<
  PaginatingEndpoints[T]['response']
>

export const paginate = async <T extends keyof PaginatingEndpoints>(
  endpoint: T,
  options: PaginatingEndpoints[T]['parameters']
): Promise<PaginateResponse<T>> => {
  const {gitHubApiToken} = useInputs()

  // TODO:@andykenward #32 fix types in @octokit-next/core or @octokit/plugin-paginate-rest . Can then remove the ts-expect-error & as Promise<PaginateResponse<T>>
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return new (Octokit.withPlugins([paginateRest]))({
    auth: gitHubApiToken
  }).paginate(endpoint, options) as Promise<PaginateResponse<T>>
}
