import * as Duration from 'effect/Duration'
import * as Layer from 'effect/Layer'

import {CloudflareApi} from '@/common/cloudflare/api/client.js'
import {PollInterval} from '@/common/cloudflare/deployment/status.js'
import {CommonInputs} from '@/common/inputs.js'

/** `CloudflareApi` on its own, built from the inputs `vitest.setup.ts` stubs. */
export const CloudflareApiTestLayer = CloudflareApi.layer.pipe(
  Layer.provide(CommonInputs.layer)
)

/** Poll without delay; interceptors assert the call count instead. */
export const NoPollDelay = Layer.succeed(PollInterval, Duration.zero)
