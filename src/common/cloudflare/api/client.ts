import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'
import * as Schema from 'effect/Schema'
import createClient from 'openapi-fetch'

import type {paths} from '@/types/cloudflare/pages.js'

import {errorMessage} from '@/common/errors.js'
import {CommonInputs, secret} from '@/common/inputs.js'

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

/**
 * Typed Cloudflare Pages REST client. Request paths, params and response bodies
 * are inferred from the generated OpenAPI `paths` ([`__generated__/types/cloudflare/pages.ts`](../../../../__generated__/types/cloudflare/pages.ts)).
 * The Cloudflare `{success, result, errors}` envelope is unwrapped by `unwrap`
 * / `unwrapSuccess` in [`fetch-result.ts`](./fetch-result.ts); wrap the call
 * in `Effect.tryPromise` with `catch: CloudflareApiError.from`.
 */
export class CloudflareApi extends Context.Service<
  CloudflareApi,
  ReturnType<typeof createClient<paths>>
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

      return CloudflareApi.of(client)
    })
  )
}
