import * as Effect from 'effect/Effect'
import {vi} from 'vitest'

import type {createGitHubDeployment as originalCreateGitHubDeployment} from '../create.js'

export const createGitHubDeployment = vi.fn<
  typeof originalCreateGitHubDeployment
>(() => Effect.undefined)
