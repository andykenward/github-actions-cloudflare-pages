import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'

import {PayloadV1Inputs} from '@/common/inputs.js'

import type {PayloadGithubDeploymentV2} from './types.js'

import {PayloadV1, PayloadV2} from './types.js'

// oxlint-disable-next-line unicorn/throw-new-error
class PayloadError extends Schema.TaggedError<PayloadError>()('PayloadError', {
  message: Schema.String
}) {}

/**
 * A deployment payload arrives either already decoded or as a JSON string,
 * depending on how it was written. Each schema accepts both; a malformed
 * string decodes as neither and fails below rather than throwing.
 */
const decodeV2 = Schema.decodeUnknownOption(
  Schema.Union([PayloadV2, Schema.fromJsonString(PayloadV2)])
)
const decodeV1 = Schema.decodeUnknownOption(
  Schema.Union([PayloadV1, Schema.fromJsonString(PayloadV1)])
)

export const getPayload = Effect.fn('getPayload')(function* (
  payload: unknown
): Effect.fn.Return<
  PayloadGithubDeploymentV2,
  PayloadError | Effect.Error<PayloadV1Inputs['Service']['cloudflare']>,
  PayloadV1Inputs
> {
  const payloadV2 = decodeV2(payload)
  if (Option.isSome(payloadV2)) {
    return payloadV2.value
  }

  const payloadV1 = decodeV1(payload)
  if (Option.isSome(payloadV1)) {
    /**
     * To support old payloads we need to get the Cloudflare Account Id and Cloudflare Project Name.
     */
    const {cloudflare} = yield* PayloadV1Inputs
    const {accountId, projectName} = yield* cloudflare

    return {
      url: payloadV1.value.url,
      commentId: payloadV1.value.commentId,
      cloudflare: {
        id: payloadV1.value.cloudflareId,
        accountId,
        projectName
      }
    }
  }

  return yield* new PayloadError({message: 'Payload is not valid'})
})
