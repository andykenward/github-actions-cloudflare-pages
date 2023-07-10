/* eslint-disable @typescript-eslint/ban-ts-comment */

import type {PaginatingEndpoints} from '@octokit/plugin-paginate-rest'

import {Octokit} from '@octokit-next/core'
import {paginateRest} from '@octokit/plugin-paginate-rest'
import {getInput} from '@unlike/github-actions-core'

import {ACTION_INPUT_GITHUB_TOKEN} from '@/src/constants.js'

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
  const token = getInput(ACTION_INPUT_GITHUB_TOKEN, {required: true})

  // TODO:@andykenward #32 fix types in @octokit-next/core or @octokit/plugin-paginate-rest . Can then remove the ts-expect-error & as Promise<PaginateResponse<T>>
  // @ts-expect-error
  return new (Octokit.withPlugins([paginateRest]))({auth: token}).paginate(
    endpoint,
    options
  ) as Promise<PaginateResponse<T>>
}
