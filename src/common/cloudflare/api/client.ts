import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import {flow} from 'effect/Function'
import * as FetchHttpClient from 'effect/http/FetchHttpClient'
import * as HttpClient from 'effect/http/HttpClient'
import * as HttpClientRequest from 'effect/http/HttpClientRequest'
import * as Layer from 'effect/Layer'

import type {CloudflarePages} from '@/types/cloudflare/pages.js'

import {CommonInputs} from '@/common/inputs.js'
import {make} from '@/types/cloudflare/pages.js'

import type {CloudflareApiError} from './error.js'
import type {ClientResponse, OperationError} from './fetch-result.js'

import {operationFailure, unwrap, unwrapSuccess} from './fetch-result.js'

export {CloudflareApiError} from './error.js'

/**
 * Base URL for Cloudflare's REST API. The generated operations' paths are
 * relative to the `/client/v4` prefix, so it lives here rather than in each.
 */
const BASE_URL = 'https://api.cloudflare.com/client/v4'

/**
 * Pass as (or spread into) an operation's options: the client then returns
 * the response beside the body, which is where a failure's URL comes from.
 */
export const WITH_RESPONSE = {config: {includeResponse: true}} as const

/**
 * One request: an operation of the generated client, called with
 * `WITH_RESPONSE`. Interrupting the effect aborts the fetch.
 */
type Operation<R> = (
  client: CloudflarePages
) => Effect.Effect<ClientResponse<R>, OperationError>

/**
 * The Cloudflare Pages REST API. Each method makes one request with the
 * generated client — one typed method per operation, from Cloudflare's OpenAPI
 * schema ([`__generated__/types/cloudflare/pages.ts`](../../../../__generated__/types/cloudflare/pages.ts))
 * — and unwraps the `{success, result, errors}` envelope with `unwrap` /
 * `unwrapSuccess` ([`fetch-result.ts`](./fetch-result.ts)). A transport
 * failure or an error envelope fails with `CloudflareApiError`, whose
 * `reason` says which ([`error.ts`](./error.ts)).
 */
export class CloudflareApi extends Context.Service<
  CloudflareApi,
  {
    /** Returns the envelope's typed `result`. */
    result<R>(operation: Operation<R>): Effect.Effect<R, CloudflareApiError>
    /** For requests with no meaningful `result` (e.g. DELETE). */
    success(
      operation: Operation<unknown>
    ): Effect.Effect<void, CloudflareApiError>
  }
>()(
  'github-actions-cloudflare-pages/common/cloudflare/api/client/CloudflareApi'
) {
  /**
   * The base URL and auth are attached once, to every request. The token stays
   * `Redacted` until `bearerToken` writes the header.
   */
  static readonly layer = Layer.effect(
    CloudflareApi,
    Effect.gen(function* () {
      const {cloudflareApiToken} = yield* CommonInputs
      const httpClient = yield* HttpClient.HttpClient

      const client = make(
        httpClient.pipe(
          HttpClient.mapRequest(
            flow(
              HttpClientRequest.prependUrl(BASE_URL),
              HttpClientRequest.bearerToken(cloudflareApiToken),
              HttpClientRequest.acceptJson
            )
          )
        )
      )

      const send = <R>(operation: Operation<R>) =>
        operation(client).pipe(
          Effect.catch(operationFailure),
          // No tracer is exported, so `traceparent` / `b3` headers would only
          // hand Cloudflare ids nothing else records.
          Effect.provideService(HttpClient.TracerPropagationEnabled, false)
        )

      return CloudflareApi.of({
        result: operation =>
          send(operation).pipe(
            Effect.flatMap(response => Effect.fromResult(unwrap(response)))
          ),
        success: operation =>
          send(operation).pipe(
            Effect.flatMap(response =>
              Effect.fromResult(unwrapSuccess(response))
            )
          )
      })
    })
  ).pipe(Layer.provide(FetchHttpClient.layer))
}
