import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'
import createClient from 'openapi-fetch'

import type {paths} from '@/types/cloudflare/pages.js'

import {errorMessage} from '@/common/errors.js'
import {CommonInputs, secret} from '@/common/inputs.js'

import type {ClientResponse} from './fetch-result.js'

import {unwrap, unwrapSuccess} from './fetch-result.js'

/**
 * Base URL for Cloudflare's REST API. The generated `paths` are relative to the
 * `/client/v4` prefix, so it lives here rather than in each operation path.
 */
const BASE_URL = 'https://api.cloudflare.com/client/v4'

/**
 * A failed Cloudflare request. `cause` keeps the original error — typically a
 * `ParseError` carrying the Cloudflare error `code`.
 */
// oxlint-disable-next-line unicorn/throw-new-error
export class CloudflareApiError extends Schema.TaggedError<CloudflareApiError>()(
  'CloudflareApiError',
  {
    message: Schema.String,
    cause: Schema.Defect()
  }
) {
  static readonly from = (cause: unknown): CloudflareApiError =>
    new CloudflareApiError({message: errorMessage(cause), cause})
}

type CloudflareClient = ReturnType<typeof createClient<paths>>

/**
 * The Cloudflare Pages REST API. Each method makes one request with the typed
 * client — paths, params and response bodies are inferred from the generated
 * OpenAPI `paths` ([`__generated__/types/cloudflare/pages.ts`](../../../../__generated__/types/cloudflare/pages.ts))
 * — and unwraps the `{success, result, errors}` envelope with `unwrap` /
 * `unwrapSuccess` ([`fetch-result.ts`](./fetch-result.ts)). A transport
 * failure or an error envelope fails with `CloudflareApiError`.
 */
export class CloudflareApi extends Context.Service<
  CloudflareApi,
  {
    /** Returns the envelope's typed `result`. */
    result<R>(
      request: (client: CloudflareClient) => Promise<ClientResponse<R>>
    ): Effect.Effect<R, CloudflareApiError>
    /** For requests with no meaningful `result` (e.g. DELETE): returns `success`. */
    success(
      request: (client: CloudflareClient) => Promise<ClientResponse<unknown>>
    ): Effect.Effect<boolean, CloudflareApiError>
  }
>()(
  'github-actions-cloudflare-pages/common/cloudflare/api/client/CloudflareApi'
) {
  /** Auth is attached once, by middleware closing over the token. */
  static readonly layer = Layer.effect(
    CloudflareApi,
    Effect.gen(function* () {
      const {cloudflareApiToken} = yield* CommonInputs
      const client = createClient<paths>({baseUrl: BASE_URL})

      client.use({
        onRequest({request}) {
          request.headers.set(
            'Authorization',
            `Bearer ${secret(cloudflareApiToken)}`
          )
          request.headers.set('Content-Type', 'application/json;charset=UTF-8')
          return request
        }
      })

      return CloudflareApi.of({
        result: request =>
          Effect.tryPromise({
            try: async () => unwrap(await request(client)),
            catch: CloudflareApiError.from
          }),
        success: request =>
          Effect.tryPromise({
            try: async () => unwrapSuccess(await request(client)),
            catch: CloudflareApiError.from
          })
      })
    })
  )
}
