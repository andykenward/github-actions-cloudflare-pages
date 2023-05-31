import {vi} from 'vitest'

import * as results from '../fetch-result'
import {API_RESPONSE_OK} from './responses/200'

export const fetchResult = vi
  .fn<
    Parameters<typeof results.fetchResult>,
    ReturnType<typeof results.fetchResult>
  >()
  .mockResolvedValue(API_RESPONSE_OK.result)
