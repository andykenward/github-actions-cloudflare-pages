import * as Effect from 'effect/Effect'
import * as Option from 'effect/Option'
import * as Predicate from 'effect/Predicate'
import * as Result from 'effect/Result'
import * as Schema from 'effect/Schema'

import {PayloadV1Inputs} from '@/common/inputs.js'

import type {GitHubDeployment} from './get.js'
import type {PayloadGithubDeploymentV2} from './types.js'

export type Payload = GitHubDeployment['payload']

// oxlint-disable-next-line unicorn/throw-new-error
class PayloadError extends Schema.TaggedError<PayloadError>()('PayloadError', {
  message: Schema.String
}) {}

const CommentId = Schema.optional(Schema.String)

/** The current payload shape, written by `createGitHubDeployment`. */
const PayloadV2 = Schema.Struct({
  url: Schema.String,
  commentId: CommentId,
  cloudflare: Schema.Struct({
    id: Schema.String,
    accountId: Schema.String,
    projectName: Schema.String
  })
})

/** Payloads written before the Cloudflare account/project were embedded. */
const PayloadV1 = Schema.Struct({
  url: Schema.String,
  commentId: CommentId,
  cloudflareId: Schema.String
})

/**
 * A deployment payload arrives either already decoded or as a JSON string,
 * depending on how it was written. Accept both.
 *
 * Previously each shape was sniffed with a hand-written predicate that parsed
 * the string only to inspect it, then returned the *original* value — so a
 * JSON-string payload was returned as a string typed as an object, and callers
 * silently destructured `undefined`s out of it.
 */
const decodeJson = Schema.decodeUnknownResult(
  Schema.fromJsonString(Schema.Unknown)
)

/**
 * Yields `undefined` for a malformed JSON string rather than throwing — the
 * previous implementation called `JSON.parse` unguarded and only avoided
 * crashing because a caller happened to wrap it in a blanket try/catch.
 */
const normalise = (payload: Payload): unknown =>
  Predicate.isString(payload)
    ? Option.getOrUndefined(Result.getSuccess(decodeJson(payload)))
    : payload

const decodeV2 = Schema.decodeUnknownResult(PayloadV2)
const decodeV1 = Schema.decodeUnknownResult(PayloadV1)

export const getPayload = Effect.fn('getPayload')(function* (payload: Payload) {
  const decoded = normalise(payload)

  const v2 = Option.getOrUndefined(Result.getSuccess(decodeV2(decoded)))
  if (v2 !== undefined) {
    return {
      url: v2.url,
      commentId: v2.commentId,
      cloudflare: v2.cloudflare
    } satisfies PayloadGithubDeploymentV2
  }

  const v1 = Option.getOrUndefined(Result.getSuccess(decodeV1(decoded)))
  if (v1 !== undefined) {
    /**
     * To support old payloads we need to get the Cloudflare Account Id and Cloudflare Project Name.
     */
    const {cloudflare} = yield* PayloadV1Inputs
    const {accountId, projectName} = yield* cloudflare

    return {
      url: v1.url,
      commentId: v1.commentId,
      cloudflare: {
        id: v1.cloudflareId,
        accountId,
        projectName
      }
    } satisfies PayloadGithubDeploymentV2
  }

  return yield* new PayloadError({message: 'Payload is not valid'})
})
