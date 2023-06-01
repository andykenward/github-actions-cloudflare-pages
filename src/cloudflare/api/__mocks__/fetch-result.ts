import {vi} from 'vitest'

import * as results from '../fetch-result.js'
import {API_RESPONSE_OK} from './responses/200.js'

export const fetchResult = vi
  .fn<
    Parameters<typeof results.fetchResult>,
    ReturnType<typeof results.fetchResult>
  >()
  .mockResolvedValue(API_RESPONSE_OK.result)
