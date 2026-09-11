import {it} from '@effect/vitest'
import * as Effect from 'effect/Effect'
import {describe, expect, vi} from 'vitest'

import type {Payload} from '@/common/github/deployment/payload.js'
import type {
  PayloadGithubDeployment,
  PayloadGithubDeploymentV2
} from '@/common/github/deployment/types.js'

import {errorMessage} from '@/common/errors.js'
import {getPayload} from '@/common/github/deployment/payload.js'
import {PayloadV1Inputs} from '@/common/inputs.js'
import {
  INPUT_KEY_CLOUDFLARE_ACCOUNT_ID,
  INPUT_KEY_CLOUDFLARE_PROJECT_NAME
} from '@/input-keys'
import {stubInputEnv} from '@/tests/helpers/inputs.js'

const PAYLOAD_V1 = {
  cloudflareId: 'cf-id',
  commentId: 'comment-id-123',
  url: 'https://example.com'
} as const satisfies PayloadGithubDeployment

const PAYLOAD_V2 = {
  cloudflare: {
    id: 'cf-id',
    accountId: 'cf-account-id',
    projectName: 'cf-project'
  },
  commentId: 'comment-id-123',
  url: 'https://example.com'
} as const satisfies PayloadGithubDeploymentV2

/** A fresh `PayloadV1Inputs` per call, so env stubbed beforehand is read. */
const decode = (payload: Payload) =>
  getPayload(payload).pipe(Effect.provide(PayloadV1Inputs.layer))

// `Effect.fn` returns an anonymous function, so the title is a string.
// oxlint-disable-next-line vitest/prefer-describe-function-title
describe('getPayload', () => {
  it.effect(
    'returns payload if it is already a PayloadGithubDeploymentV2',
    () =>
      Effect.gen(function* () {
        expect.assertions(1)

        const result = yield* decode(PAYLOAD_V2)

        expect(result).toMatchInlineSnapshot(`
        {
          "cloudflare": {
            "accountId": "cf-account-id",
            "id": "cf-id",
            "projectName": "cf-project",
          },
          "commentId": "comment-id-123",
          "url": "https://example.com",
        }
      `)
      })
  )

  it.effect('returns transformed payload for old payloads', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      const result = yield* decode(PAYLOAD_V1)

      expect(result).toMatchInlineSnapshot(`
        {
          "cloudflare": {
            "accountId": "mock-cloudflare-account-id",
            "id": "cf-id",
            "projectName": "mock-cloudflare-project-name",
          },
          "commentId": "comment-id-123",
          "url": "https://example.com",
        }
      `)
    })
  )

  it.effect('decodes a v2 payload supplied as a JSON string', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      // Previously the string was parsed only to sniff its shape, then the
      // original string was returned typed as an object, so callers
      // destructured `undefined`s out of it.
      const result = yield* decode(JSON.stringify(PAYLOAD_V2))

      expect(result).toStrictEqual(PAYLOAD_V2)
    })
  )

  it.effect('decodes a v1 payload supplied as a JSON string', () =>
    Effect.gen(function* () {
      expect.assertions(1)

      const result = yield* decode(JSON.stringify(PAYLOAD_V1))

      expect(result).toStrictEqual({
        cloudflare: {
          accountId: 'mock-cloudflare-account-id',
          id: 'cf-id',
          projectName: 'mock-cloudflare-project-name'
        },
        commentId: 'comment-id-123',
        url: 'https://example.com'
      })
    })
  )

  describe('errors', () => {
    const {url} = PAYLOAD_V2
    const {id, accountId, projectName} = PAYLOAD_V2.cloudflare

    // Each payload lacks exactly one field of the shape it resembles, so a
    // schema that stopped requiring that field would let its case decode.
    const BAD_PAYLOADS: Array<{missing: string; payload: Payload}> = [
      {missing: 'every field', payload: {invalidData: 'invalid'}},
      {missing: 'v1 url', payload: {cloudflareId: id}},
      {missing: 'v2 url', payload: {cloudflare: {id, accountId, projectName}}},
      {missing: 'v2 cloudflare', payload: {url, cloudflare: undefined}},
      {
        missing: 'v2 cloudflare.id',
        payload: {url, cloudflare: {accountId, projectName}}
      },
      {
        missing: 'v2 cloudflare.accountId',
        payload: {url, cloudflare: {id, projectName}}
      },
      {
        missing: 'v2 cloudflare.projectName',
        payload: {url, cloudflare: {id, accountId}}
      }
    ]

    it.effect.each(BAD_PAYLOADS)(
      'fails for a payload missing $missing',
      ({payload}) =>
        Effect.gen(function* () {
          expect.assertions(1)

          const error = yield* Effect.flip(decode(payload))

          expect(errorMessage(error)).toBe('Payload is not valid')
        })
    )

    it.effect('fails for a malformed JSON string instead of crashing', () =>
      Effect.gen(function* () {
        expect.assertions(1)

        const error = yield* Effect.flip(decode('{not valid json'))

        expect(errorMessage(error)).toBe('Payload is not valid')
      })
    )

    it.effect('fails for payloads v1 and missing inputs', () =>
      Effect.gen(function* () {
        expect.assertions(3)

        vi.unstubAllEnvs()

        expect(errorMessage(yield* Effect.flip(decode(PAYLOAD_V1)))).toBe(
          'Input required and not supplied: cloudflare-account-id'
        )

        stubInputEnv(INPUT_KEY_CLOUDFLARE_ACCOUNT_ID)

        expect(errorMessage(yield* Effect.flip(decode(PAYLOAD_V1)))).toBe(
          'Input required and not supplied: cloudflare-project-name'
        )

        stubInputEnv(INPUT_KEY_CLOUDFLARE_PROJECT_NAME)

        const {cloudflare} = yield* decode(PAYLOAD_V1)

        expect(cloudflare.accountId).toBe('mock-cloudflare-account-id')
      })
    )
  })
})
