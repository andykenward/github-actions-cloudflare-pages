import * as Layer from 'effect/Layer'

import {CloudflareApi} from '@/common/cloudflare/api/client.js'
import {CommonInputs} from '@/common/inputs.js'

/** `CloudflareApi` on its own, built from the inputs `vitest.setup.ts` stubs. */
export const CloudflareApiTestLayer = CloudflareApi.layer.pipe(
  Layer.provide(CommonInputs.layer)
)
