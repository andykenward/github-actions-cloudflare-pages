import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'
import * as Predicate from 'effect/Predicate'
import * as Schema from 'effect/Schema'

import {PayloadV1Inputs} from '@/common/inputs.js'
import {parseJson} from '@/common/json.js'

import type {GitHubDeployment} from './get.js'

import {PayloadV1, PayloadV2} from './types.js'

export type Payload = GitHubDeployment['payload']

// oxlint-disable-next-line unicorn/throw-new-error
class PayloadError extends Schema.TaggedError<PayloadError>()('PayloadError', {
  message: Schema.String
}) {}

/**
 * A deployment payload arrives either already decoded or as a JSON string,
 * depending on how it was written. Accept both; a malformed JSON string
 * becomes `undefined` and fails to decode below rather than throwing.
 *
 * Previously each shape was sniffed with a hand-written predicate that parsed
 * the string only to inspect it, then returned the *original* value — so a
 * JSON-string payload was returned as a string typed as an object, and callers
 * silently destructured `undefined`s out of it.
 */
const normalise = (payload: Payload): unknown =>
  Predicate.isString(payload) ? parseJson(payload) : payload

const decodeV2 = Schema.decodeUnknownOption(PayloadV2)
const decodeV1 = Schema.decodeUnknownOption(PayloadV1)

export const getPayload = Effect.fn('getPayload')(function* (payload: Payload) {
  const decoded = normalise(payload)

  const v2 = decodeV2(decoded)
  if (Option.isSome(v2)) {
    return v2.value
  }

  const v1 = decodeV1(decoded)
  if (Option.isSome(v1)) {
    /**
     * To support old payloads we need to get the Cloudflare Account Id and Cloudflare Project Name.
     */
    const {cloudflare} = yield* PayloadV1Inputs
    const {accountId, projectName} = yield* cloudflare

    return {
      url: v1.value.url,
      commentId: v1.value.commentId,
      cloudflare: {
        id: v1.value.cloudflareId,
        accountId,
        projectName
      }
    }
  }

  return yield* new PayloadError({message: 'Payload is not valid'})
})
