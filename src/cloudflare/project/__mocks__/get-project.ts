import {vi} from 'vitest'

import * as project from '../get-project.js'
import {PROJECT_RESPONSE_OK} from './responses/200.js'

export const getProject = vi
  .fn<
    Parameters<typeof project.getProject>,
    ReturnType<typeof project.getProject>
  >()
  .mockResolvedValue(PROJECT_RESPONSE_OK)
