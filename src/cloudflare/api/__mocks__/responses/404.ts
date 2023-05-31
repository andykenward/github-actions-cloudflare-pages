/* eslint-disable unicorn/no-null */
/* eslint-disable unicorn/numeric-separators-style */

import type {FetchResult} from '@/cloudflare/types'

export const API_RESPONSE_NOT_FOUND = {
  result: null,
  success: false,
  errors: [
    {
      code: 8000007,
      message:
        'Project not found. The specified project name does not match any of your existing projects.'
    }
  ],
  messages: []
} satisfies FetchResult<null>
