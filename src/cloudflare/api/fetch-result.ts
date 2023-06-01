import {getInput} from '@actions/core'
import {fetch, type RequestInit} from 'undici'

import type {FetchResult} from '../types'
import {throwFetchError} from './fetch-error'

/** Cloudflare API token */
export const ACTION_INPUT_API_TOKEN = 'apiToken'

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

  const response = await fetch(resource, {
    method,
    ...initFetch,
    signal: abortSignal
  })

  const json = (await response.json()) as FetchResult<ResponseType>

  if (json.success) {
    if (json.result === null || json.result === undefined) {
      throw new Error(`Cloudflare API: response missing 'result'`)
    }
    return json.result
  } else {
    throwFetchError(resource, json)
  }
}
