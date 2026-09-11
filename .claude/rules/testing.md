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
  - `src/common/__mocks__/utils.ts` — the real module, with `execFileAsync` as `vi.fn()` and `checkWorkingDirectory` as a pass-through, so working-directory validation is **off** in tests.
  - `src/common/github/__mocks__/comment.ts` — an `Effect.succeed` value plus a `vi.fn` returning an Effect.
  - `src/common/github/deployment/__mocks__/create.ts` — a `vi.fn` returning an Effect.
- Update a mock when the real export's signature changes. An export that is an Effect _value_ can't be auto-mocked (vitest would mock the Effect's own methods) — give it a manual mock, or stub the service it reads.

## Wrangler and polling

- Never execute wrangler — mock `execFileAsync`. It receives the effect's `AbortSignal` as `options.signal`, so a mock that settles only on abort stands in for a long upload (`__tests__/deploy/main.test.ts`).
- A mock that only resolves exercises the commit-hash fallback. To exercise polling by id, have it first append a `pages-deploy-detailed` line to `options.env.WRANGLER_OUTPUT_FILE_PATH` (`wranglerReporting` in `__tests__/common/cloudflare/deployment/create.test.ts`).
- Poll without delay by passing a zero `pollInterval`: as the `statusOptions` field of `createCloudflareDeployment`'s argument, or as the second argument of `statusCloudflareDeployment(target, options)`.

## Conventions

- Title suites with the real reference — `describe(functionName)` / `describe(ServiceClass)` — for IDE navigation. `Effect.fn` returns an anonymous function and an Effect value isn't a function, so those get a string title plus `// oxlint-disable-next-line vitest/prefer-describe-function-title`.
- `__tests__/helpers/` isn't collected. Snapshots live in `__snapshots__/` beside the test; update them deliberately with `vitest run -u`.
- `pnpm run test:coverage` measures `src/**/*.ts` only (not `bin/`, not `__mocks__/`) and writes text, HTML, lcov, `json-summary` and `json` reports to `.cache/coverage/`. A module every test replaces with a manual mock (e.g. `src/common/github/deployment/create.ts`) reports 0% — cover it with a test that imports the real module.
- To find what a change leaves untested, run the **whole** suite and narrow only the report: `pnpm run test:coverage --coverage.include=src/path/file.ts --coverage.reporter=text` prints the file's uncovered lines. Don't pass a test path — a module is often exercised by tests outside its mirror (`cloudflare/deployment/delete.ts` shows 0% from its own directory's tests, 60% from the suite). Add `--coverage.reporter=json-summary` to read percentages from `.cache/coverage/coverage-summary.json`. On a PR, the coverage comment is in `gh pr view <n> --comments`.
- Tests hitting the real network and failing with genuine API responses usually means `undici`'s major no longer matches Node's — see the tooling rule.
