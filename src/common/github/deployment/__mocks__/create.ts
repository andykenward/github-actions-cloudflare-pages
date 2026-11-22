import * as Effect from 'effect/Effect'
import {vi} from 'vitest'

import type * as Original from '../create.js'

export const createGitHubDeployment = vi.fn<
  typeof Original.createGitHubDeployment
>(() => Effect.succeed('mock-github-deployment-id'))

export const setGitHubDeploymentStatus = vi.fn<
  typeof Original.setGitHubDeploymentStatus
>(() => Effect.void)
