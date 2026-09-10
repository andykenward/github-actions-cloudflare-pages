import * as Layer from 'effect/Layer'

import {CloudflareApi} from './cloudflare/api/client.js'
import {GitHubApi} from './github/api/client.js'
import {GitHubContext} from './github/context.js'
import {CommonInputs} from './inputs.js'

/**
 * The services both actions use. The API clients need the inputs and context
 * to build, and `provideMerge` exposes all four.
 */
export const CommonLayer = Layer.mergeAll(
  GitHubApi.layer,
  CloudflareApi.layer
).pipe(
  Layer.provideMerge(Layer.mergeAll(CommonInputs.layer, GitHubContext.layer))
)
