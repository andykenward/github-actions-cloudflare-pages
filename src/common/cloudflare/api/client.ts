import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import createClient from 'openapi-fetch'

import type {paths} from '@/types/cloudflare/pages.js'

import {CommonInputs, secret} from '@/common/inputs.js'

import type {ClientResponse} from './fetch-result.js'

import {CloudflareApiError, RequestError} from './error.js'
import {unwrap, unwrapSuccess} from './fetch-result.js'

export {CloudflareApiError} from './error.js'

/**
 * Base URL for Cloudflare's REST API. The generated `paths` are relative to the
 * `/client/v4` prefix, so it lives here rather than in each operation path.
 */
const BASE_URL = 'https://api.cloudflare.com/client/v4'

type CloudflareClient = ReturnType<typeof createClient<paths>>

/**
 * One request. `signal` is the effect's: pass it as the call's `signal` so an
 * interrupt or timeout aborts the fetch rather than leaving it in flight.
 */
type Request<R> = (
  client: CloudflareClient,
  signal: AbortSignal
) => Promise<ClientResponse<R>>

/**
 * The Cloudflare Pages REST API. Each method makes one request with the typed
 * client — paths, params and response bodies are inferred from the generated
 * OpenAPI `paths` ([`__generated__/types/cloudflare/pages.ts`](../../../../__generated__/types/cloudflare/pages.ts))
 * — and unwraps the `{success, result, errors}` envelope with `unwrap` /
 * `unwrapSuccess` ([`fetch-result.ts`](./fetch-result.ts)). A transport
 * failure or an error envelope fails with `CloudflareApiError`, whose
 * `reason` says which ([`error.ts`](./error.ts)).
 */
export class CloudflareApi extends Context.Service<
  CloudflareApi,
  {
    /** Returns the envelope's typed `result`. */
    result<R>(request: Request<R>): Effect.Effect<R, CloudflareApiError>
    /** For requests with no meaningful `result` (e.g. DELETE). */
    success(request: Request<unknown>): Effect.Effect<void, CloudflareApiError>
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

      const send = <R>(request: Request<R>) =>
        Effect.tryPromise({
          try: signal => request(client, signal),
          catch: cause => CloudflareApiError.from(new RequestError({cause}))
        })

      return CloudflareApi.of({
        result: request =>
          send(request).pipe(
            Effect.flatMap(response => Effect.fromResult(unwrap(response)))
          ),
        success: request =>
          send(request).pipe(
            Effect.flatMap(response =>
              Effect.fromResult(unwrapSuccess(response))
            )
          )
      })
    })
  )
}
