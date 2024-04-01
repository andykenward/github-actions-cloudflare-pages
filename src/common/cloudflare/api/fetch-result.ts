import {useCommonInputs} from '@/common/inputs.js'

import type {FetchResult} from '../types.js'

import {throwFetchError} from './fetch-error.js'

export const fetchResult = async <ResponseType>(
  resource: string,
  init: RequestInit = {},
  queryParams?: URLSearchParams,
  abortSignal?: AbortSignal
): Promise<ResponseType> => {
  const method = init.method ?? 'GET'
  const {cloudflareApiToken} = useCommonInputs()

  const initFetch = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${cloudflareApiToken}`
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
  }
  return throwFetchError(resource, response)
}

export const fetchSuccess = async (
  resource: string,
  init: RequestInit = {}
): Promise<boolean> => {
  const method = init.method ?? 'GET'
  const {cloudflareApiToken} = useCommonInputs()

  const initFetch = {
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
      Authorization: `Bearer ${cloudflareApiToken}`
    }
  }

  const response = (await fetch(resource, {
    method,
    ...initFetch
  }).then(response => response.json())) as FetchResult<null>

  if (!response.success && response.errors.length > 0) {
    throwFetchError(resource, response)
  }

  return response.success
}
