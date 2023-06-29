import type {RequestInit} from 'undici'

import {getInput} from '@unlike/github-actions-core'

import type {FetchResult} from '../types.js'
import {ACTION_INPUT_API_TOKEN} from '../../constants.js'
import {throwFetchError} from './fetch-error.js'

export async function fetchResult<ResponseType>(
  resource: string,
  init: RequestInit = {},
  queryParams?: URLSearchParams,
  abortSignal?: AbortSignal
): Promise<ResponseType> {
  const method = init.method ?? 'GET'
  const apiToken = getInput(ACTION_INPUT_API_TOKEN, {required: true})

  const initFetch = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${apiToken}`
    }
  }

  const response = (await fetch(resource, {
    method,
    ...initFetch,
    signal: abortSignal
  }).then(response => response.json())) as FetchResult<ResponseType>

  if (response.success) {
    if (response.result === null || response.result === undefined) {
      throw new Error(`Cloudflare API: response missing 'result'`)
    }
    return response.result
  } else {
    throwFetchError(resource, response)
  }
}
