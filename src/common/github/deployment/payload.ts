import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'
import * as Schema from 'effect/Schema'

import {PayloadV1Inputs} from '@/common/inputs.js'

import type {PayloadGithubDeployment} from './types.js'

import {
  CommentId,
  PAYLOAD_VERSION,
  PayloadV1,
  PayloadV2,
  PayloadV3
} from './types.js'

// oxlint-disable-next-line unicorn/throw-new-error
class PayloadError extends Schema.TaggedError<
  PayloadError,
  {readonly brand: unique symbol}
>()('PayloadError', {
  message: Schema.String
}) {}

/**
 * A deployment payload arrives either already decoded or as a JSON string,
 * depending on how it was written. Each schema accepts both; a malformed
 * string decodes as neither and fails below rather than throwing.
 */
const decodeV3 = Schema.decodeUnknownOption(
  Schema.Union([PayloadV3, Schema.fromJsonString(PayloadV3)])
)
const decodeV2 = Schema.decodeUnknownOption(
  Schema.Union([PayloadV2, Schema.fromJsonString(PayloadV2)])
)
const decodeV1 = Schema.decodeUnknownOption(
  Schema.Union([PayloadV1, Schema.fromJsonString(PayloadV1)])
)

/** Every payload version has `commentId`; nothing else is read here. */
const PayloadCommentId = Schema.Struct({commentId: CommentId})
/**
 * REST gives the stored object; GraphQL's `payload` is that JSON encoded
 * again, a JSON string whose value is the JSON text (checked live
 * 2026-11-22), so it takes two parses.
 */
const decodeCommentId = Schema.decodeUnknownOption(
  Schema.Union([
    PayloadCommentId,
    Schema.fromJsonString(PayloadCommentId),
    Schema.fromJsonString(Schema.fromJsonString(PayloadCommentId))
  ])
)

/** The comment a payload of any version recorded, if any. */
export const payloadCommentId = (payload: unknown): string | undefined => {
  const decoded = decodeCommentId(payload)
  return Option.isSome(decoded) ? decoded.value.commentId : undefined
}

/** Only the version, to tell a payload from a newer release apart. */
const PayloadVersion = Schema.Struct({version: Schema.Number})
const decodeVersion = Schema.decodeUnknownOption(
  Schema.Union([PayloadVersion, Schema.fromJsonString(PayloadVersion)])
)

/**
 * A payload no known schema decodes. One with a `version` above ours was
 * written by a newer deploy action, so the message says what to upgrade.
 */
const getPayloadError = (payload: unknown): PayloadError => {
  const version = decodeVersion(payload)
  if (Option.isSome(version) && version.value.version > PAYLOAD_VERSION) {
    return new PayloadError({
      message: `Payload version ${version.value.version} is newer than this delete action supports; upgrade andykenward/github-actions-cloudflare-pages/delete to the version your deploy action uses.`
    })
  }
  return new PayloadError({message: 'Payload is not valid'})
}

export const getPayload = Effect.fn('getPayload')(function* (
  payload: unknown
): Effect.fn.Return<
  PayloadGithubDeployment,
  PayloadError | Effect.Error<PayloadV1Inputs['Service']['cloudflare']>,
  PayloadV1Inputs
> {
  const payloadV3 = decodeV3(payload)
  if (Option.isSome(payloadV3)) {
    const {commentId, cloudflare} = payloadV3.value
    return {commentId, cloudflare}
  }

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

  return yield* getPayloadError(payload)
})
