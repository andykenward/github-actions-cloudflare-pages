import createClient from 'openapi-fetch'

import type {paths} from '@/types/cloudflare/pages.js'

import {useCommonInputs} from '@/common/inputs.js'

/**
 * Base URL for Cloudflare's REST API. The generated `paths` are relative to the
 * `/client/v4` prefix, so it lives here rather than in each operation path.
 */
const BASE_URL = 'https://api.cloudflare.com/client/v4'

/**
 * Typed Cloudflare Pages REST client. Request paths, params and response bodies
 * are inferred from the generated OpenAPI `paths` ([`__generated__/types/cloudflare/pages.ts`](../../../../__generated__/types/cloudflare/pages.ts)).
 * The Cloudflare `{success, result, errors}` envelope is unwrapped by `unwrap`
 * / `unwrapSuccess` in [`fetch-result.ts`](./fetch-result.ts).
 */
export const cloudflareClient = createClient<paths>({baseUrl: BASE_URL})

/**
 * Attach auth on every request. Read lazily per-request so the token is sourced
 * at call time (matching the previous per-fetch `useCommonInputs()` behaviour).
 */
cloudflareClient.use({
  onRequest({request}) {
    const {cloudflareApiToken} = useCommonInputs()
    request.headers.set('Authorization', `Bearer ${cloudflareApiToken}`)
    request.headers.set('Content-Type', 'application/json;charset=UTF-8')
    return request
  }
})
