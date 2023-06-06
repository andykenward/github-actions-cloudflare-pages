import type {FetchResult} from '../../../types.js'

export const API_RESPONSE_OK = {
  success: true,
  errors: [],
  messages: [],
  result: {id: 'mock-id'}
} satisfies FetchResult<{id: 'mock-id'}>
