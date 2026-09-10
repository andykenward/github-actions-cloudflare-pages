import * as Effect from 'effect/Effect'

import type {Environment} from '../environment.js'

const ENVIRONMENT = {
  name: 'unlike-dev (Preview)',
  id: 'EN_kwDOJn0nrM5D_l8n',
  refId: 'MDg6Q2hlY2tSdW4xMjM0NTY3ODk='
} satisfies Environment

export const createEnvironment = Effect.succeed(ENVIRONMENT)

export const checkEnvironment = Effect.succeed(ENVIRONMENT)
