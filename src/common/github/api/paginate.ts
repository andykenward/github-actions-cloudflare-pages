import assert from 'node:assert/strict'

import * as Context from 'effect/Context'
import * as Effect from 'effect/Effect'
import * as Layer from 'effect/Layer'

import {CommonInputs, secret} from '@/common/inputs.js'

import {GitHubContext} from '../context.js'
import {GitHubApiError} from './client.js'

/** GitHub's maximum `per_page`. */
export const PAGE_SIZE = 100

/**
 * The most pages one listing follows: 10 000 deployments of one branch. A
 * server that always sends a `next` link would otherwise be followed forever.
 */
const PAGE_COUNT_MAX = 100

export const PageCountMax = Context.Reference<number>(
  'github-actions-cloudflare-pages/common/github/api/paginate/PageCountMax',
  {defaultValue: () => PAGE_COUNT_MAX}
)

/** Query parameters; an `undefined` value leaves the parameter out. */
export type Query = Record<string, string | number | undefined>

/** A page of a list endpoint and, from its `Link` header, the next page's URL. */
type Page = {items: ReadonlyArray<unknown>; next: string | undefined}

/**
 * The URL of the page after this one, from the `Link` header GitHub sends
 * with a paginated response, e.g.
 * `<https://api.github.com/…?page=2>; rel="next", <…?page=5>; rel="last"`.
 */
const nextLink = (link: string | null): string | undefined => {
  const nextUrl = link?.match(/<([^>]+)>;\s*rel="next"/)?.[1]
  // GitHub links absolute URLs; a relative one would be a parsing bug.
  assert.ok(nextUrl === undefined || URL.canParse(nextUrl))
  return nextUrl
}

const fetchPage = async (
  url: string,
  token: string,
  signal: AbortSignal
): Promise<Page> => {
  const response = await fetch(url, {
    headers: {
      authorization: `bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28'
    },
    signal
  })

  const body: unknown = await response.json().catch((error: unknown) => {
    throw new Error(
      `GitHub API returned a non-JSON response (${response.status})`,
      {cause: error}
    )
  })

  /**
   * A REST error body carries the reason as `message` (e.g. `Resource not
   * accessible by integration`). The status stays on the error, as the cause
   * a caller can inspect.
   */
  if (!response.ok) {
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : `GitHub API request failed: ${response.status} ${response.statusText}`

    throw Object.assign(new Error(message), {status: response.status})
  }

  if (!Array.isArray(body)) {
    throw new TypeError(`GitHub API returned a non-array response (${url})`)
  }

  return {items: body, next: nextLink(response.headers.get('link'))}
}

/**
 * GitHub's REST API, for the one call that is not GraphQL: listing
 * deployments, which GraphQL can't filter by branch. Provided by `DeleteLayer`
 * only, the one action that lists them.
 */
export class GitHubRestApi extends Context.Service<
  GitHubRestApi,
  {
    /**
     * Every item of every page of the list endpoint at `path` (relative to
     * the API URL), following `Link` headers for up to `PageCountMax` pages.
     * Interrupting the effect aborts the request in flight.
     */
    paginate(
      path: string,
      query: Query
    ): Effect.Effect<ReadonlyArray<unknown>, GitHubApiError>
  }
>()(
  'github-actions-cloudflare-pages/common/github/api/paginate/GitHubRestApi'
) {
  /** The token and API URL are read once, when the layer is built. */
  static readonly layer = Layer.effect(
    GitHubRestApi,
    Effect.gen(function* () {
      const {gitHubApiToken} = yield* CommonInputs
      const {apiUrl} = yield* GitHubContext

      const paginate = Effect.fn('GitHubRestApi.paginate')(function* (
        path: string,
        query: Query
      ) {
        // Not `new URL(path, apiUrl)`: a leading `/` would drop a GHES
        // prefix such as `/api/v3`.
        const url = new URL(`${apiUrl.replace(/\/+$/, '')}${path}`)
        for (const [key, value] of Object.entries(query)) {
          if (value !== undefined) {
            url.searchParams.set(key, String(value))
          }
        }

        const pageCountMax = yield* PageCountMax
        assert.ok(pageCountMax >= 1)
        const items: Array<unknown> = []
        let nextUrl: string | undefined = url.href

        for (
          let pageIndex = 0;
          pageIndex < pageCountMax && nextUrl !== undefined;
          pageIndex++
        ) {
          // A closure can't narrow the loop variable, so pin this page's URL.
          const pageUrl = nextUrl
          const page: Page = yield* Effect.tryPromise({
            try: signal => fetchPage(pageUrl, secret(gitHubApiToken), signal),
            catch: GitHubApiError.from
          })
          // GitHub caps a page at 100 whatever `per_page` asks for.
          assert.ok(page.items.length <= PAGE_SIZE)
          items.push(...page.items)
          nextUrl = page.next
        }

        if (nextUrl !== undefined) {
          return yield* new GitHubApiError({
            message: `GitHub API listing ${path} still had pages after ${pageCountMax}; narrow the query`,
            cause: {pageCountMax, nextUrl}
          })
        }

        return items
      })

      return GitHubRestApi.of({paginate})
    })
  )
}
