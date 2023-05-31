import type {FetchNoResult} from '@/cloudflare/types'

/* eslint-disable unicorn/numeric-separators-style */
export const API_RESPONSE_UNAUTHORIZED = {
  success: false,
  errors: [
    {
      code: 10000,
      message: 'Authentication error'
    }
  ]
} satisfies FetchNoResult

export const API_RESPONSE_UNAUTHORIZED_SUCCESS = {
  success: true,
  errors: [
    {
      code: 10000,
      message: 'Authentication error'
    }
  ]
} satisfies FetchNoResult
