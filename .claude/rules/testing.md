---
paths:
  - '__tests__/**'
  - '**/__mocks__/**'
  - 'vitest.config.ts'
  - 'vitest.setup.ts'
---

# Testing

## Setup and helpers

- `vitest.setup.ts` stubs required env and input vars before each test.
- `__mocks__/@actions/core.ts` replaces only what this repo uses: `getInput` (passes through to the real one), `setOutput`, `error`, `notice`, `debug`, `isDebug` (returns `false`), `setFailed`, `setSecret`, `info`, `warning`, and `summary` (the real one with `addTable`, `addHeading`, `addBreak`, `addRaw`, `write` mocked). Anything else is `undefined` in tests — add it there when `src/` starts using it.
- `stubRequiredInputEnv()` (`__tests__/helpers/inputs.ts`) covers `INPUT_KEYS_REQUIRED`. Stub any other input per test with `stubInputEnv(INPUT_KEY_X, value)` and assert its default.
- A layer reads the env when it is built, so stub before the `Effect.provide` that builds it runs: `yield*` an effect wrapped in `Effect.provide(X.layer)` after stubbing (`__tests__/deploy/inputs.test.ts`), or stub before returning an effect whose outermost pipe provides the layer.
- `stubTestEnvVars(eventName)` (`__tests__/helpers/env.ts`) loads a payload from `__generated__/payloads/` for `pull_request` (default), `workflow_dispatch` or `workflow_run`. Any other event throws — add a case.
- HTTP goes through undici `MockAgent` (`__tests__/helpers/api.ts`). Assert `mockApi.mockAgent.assertNoPendingInterceptors()` to catch missed calls.
- `interceptCloudflare` only replies with a `FetchResult` JSON envelope. For an empty (204) body or a network error, `interceptCloudflareRaw(path, method)` returns the undici interceptor: `.reply(204, '')` / `.replyWithError(error)`. `CloudflareApiTestLayer` (`__tests__/helpers/layers.ts`) provides `CloudflareApi` alone. Both interceptors require `authorization: Bearer mock-cloudflare-api-token`, so every Cloudflare test also checks the client's auth middleware.
- Mock the one REST call (`GitHubRestApi.paginate`) with `interceptGithubRest({path, query, headers}, body, status?, responseHeaders?)`: it replies with the JSON content type Octokit needs to parse a body. undici matches `query` exactly.
- Entry-point tests (`__tests__/{deploy,delete}/index.test.ts`) keep `vi.mock` / `vi.hoisted` in the test file (hoisting) and share `runEntryPoint` and `testRunOutcomes` (`__tests__/helpers/entry-point.ts`).
- Fixtures: `__generated__/payloads/` (generated) and `__generated__/responses/` (hand-maintained — add to it freely).

## Effect tests

- Use `it.effect` from `@effect/vitest`. Import only `it` from it and `describe` / `expect` / `vi` from `vitest`, so `vi.mock` hoisting still applies.
- Use `it.live` where code sleeps (status polling) — `it.effect` runs on a `TestClock`.
- Provide what the test needs: `CommonLayer` (`src/common/layer.ts`), `DeployLayer` / `DeleteLayer`, one `X.layer`, or a stub `Layer.succeed(Service, Service.of({...}))` provided _inside_ the real layer (`Effect.provide(stub), Effect.provide(DeleteLayer)`) to take its place.
- Assert failures with `const error = yield* Effect.flip(effect)`. Write `it.effect.each` cases as objects.
- `effecttsgo/strict-effect-provide` and `multiple-effect-provide` are off for tests — each test is an entry point.

## Mocks

- Always `vi.mock(import('@/...'))` with path aliases, to match vitest's aliases. `vi.mock(import('@actions/core'))` auto-loads the `__mocks__` file.
- Manual mocks sit beside their source in `src/**/__mocks__/` and are picked up by a bare `vi.mock(import(...))`:
  - `src/common/__mocks__/utils.ts` — the real module with only `execFileAsync` replaced by `vi.fn()`; working-directory validation still runs, so a stubbed `working-directory` must exist.
  - `src/common/github/__mocks__/comment.ts` — an `Effect.succeed` value plus a `vi.fn` returning an Effect.
  - `src/common/github/deployment/__mocks__/create.ts` — a `vi.fn` returning an Effect.
- Update a mock when the real export's signature changes. An export that is an Effect _value_ can't be auto-mocked (vitest would mock the Effect's own methods) — give it a manual mock, or stub the service it reads.

## Wrangler and polling

- Never execute wrangler — mock `execFileAsync`. It receives the effect's `AbortSignal` as `options.signal`, so a mock that settles only on abort stands in for a long upload (`__tests__/deploy/main.test.ts`).
- A mock that only resolves exercises the commit-hash fallback. To exercise polling by id, have it first append a `pages-deploy-detailed` line to `options.env.WRANGLER_OUTPUT_FILE_PATH` (`wranglerReporting` in `__tests__/helpers/wrangler.ts`).
- Poll without delay by passing a zero `pollInterval`: as the `statusOptions` field of `createCloudflareDeployment`'s argument, or as the second argument of `statusCloudflareDeployment(target, options)`.

## Conventions

- Title suites with the real reference — `describe(functionName)` / `describe(ServiceClass)` — for IDE navigation. `Effect.fn` returns an anonymous function and an Effect value isn't a function, so those get a string title plus `// oxlint-disable-next-line vitest/prefer-describe-function-title`.
- `__tests__/helpers/` isn't collected. Snapshots live in `__snapshots__/` beside the test; update them deliberately with `vitest run -u`.
- Never snapshot a fixture or a mock's own return — assert `toStrictEqual(FIXTURE.result)`. A snapshot of test input can't fail on a behavior change, and breaks on every fixture refresh.
- Pick inputs that tell the branches apart: each invalid case misses exactly one field (not also a shared one, which fails them all for the same reason), and values the code chooses between must differ (the default env gives `branch` and `ref` the same value — stub `GITHUB_HEAD_REF=''` when that matters).
- Prove a new or suspect test by breaking the line it guards, running the one file, then `git checkout -- <src file>`. A test that still passes guards nothing; an `expect.assertions` count doesn't change that.
- `pnpm run test:coverage` measures `src/**/*.ts` only (not `bin/`, not `__mocks__/`) and writes text, HTML, lcov, `json-summary` and `json` reports to `.cache/coverage/`. A module other tests replace with a manual mock reports 0% unless one test imports the real module (`__tests__/common/github/deployment/create.test.ts` does so for `create.ts`).
- To find what a change leaves untested, run the **whole** suite and narrow only the report: `pnpm run test:coverage --coverage.include=src/path/file.ts --coverage.reporter=text` prints the file's uncovered lines. Don't pass a test path — modules are also exercised by tests outside their mirror (`batch-delete.ts` runs Cloudflare's `delete.ts`), so a scoped run under-reports. Add `--coverage.reporter=json-summary` to read percentages from `.cache/coverage/coverage-summary.json`. On a PR, the coverage comment is in `gh pr view <n> --comments`.
- Tests hitting the real network and failing with genuine API responses usually means `undici`'s major no longer matches Node's — see the tooling rule.
