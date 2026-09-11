---
paths:
  - 'src/**/*.ts'
  - '__tests__/**/*.ts'
---

# Effect patterns

`src/common/` is Effect throughout. Code with no dependencies stays plain — `src/common/cloudflare/api/fetch-result.ts`, payload and event decoding, `src/common/utils.ts`, the body of `src/common/github/context.ts`.

## Structure

- Write a helper as `Effect.fn('name')`, or as an Effect value when it takes no arguments (`effecttsgo/lazy-effect`). Take dependencies from services, never module state.
- Services are `Context.Service` classes with a `static readonly layer`: `CommonInputs` and `PayloadV1Inputs` (`src/common/inputs.ts`), `DeployInputs`, `DeleteInputs`, `GitHubContext` (`src/common/github/context.ts`), `GitHubApi` (`src/common/github/api/client.ts`), `GitHubRestApi` (`src/common/github/api/paginate.ts`), `CloudflareApi` (`src/common/cloudflare/api/client.ts`). API clients capture their token when the layer is built.
- Layers: `CommonLayer` (`src/common/layer.ts`) = inputs, context, both API clients. `DeployLayer` (`src/deploy/main.ts`) adds `DeployInputs`. `DeleteLayer` (`src/delete/main.ts`) adds `DeleteInputs`, `PayloadV1Inputs` and `GitHubRestApi`.
- Memoise in the layer, not the module: `Effect.provide` builds each layer once per run and shares it by reference (`CommonInputs.layer` appears twice in `DeleteLayer` and is built once — a test asserts it). With no module-level caches, a failed build never leaks into the next test. Use `Effect.cached` only to defer layer work: `PayloadV1Inputs.cloudflare` parses the optional V1 fallback inputs on first use.
- Export `run` as an `Effect` value that requires the services, so tests can provide their own layers.

## Entry points (`src/deploy/index.ts`, `src/delete/index.ts`)

- Run `Effect.runPromiseExit(run.pipe(Effect.provide(DeployLayer)))` with `// oxlint-disable-next-line effecttsgo/strict-effect-provide`, then `reportFailure(exit.cause)` (`src/common/errors.ts`) unless interrupt-only. `setFailed` gets a one-line `errorMessage()`; the full `Cause.pretty` goes to `debug()`.
- A missing or invalid input fails the layer build and is reported the same way: `errorMessage()` maps `ConfigError` to `Input required and not supplied: <key>` / `Input '<key>' is invalid: …`.
- Never use `void run()` / `runFork` (a failed deploy exits 0) or `NodeRuntime.runMain` (its `process.exit` can truncate buffered workflow commands).

## Errors and logging

- Give each module its own `Schema.TaggedError` class(es) — `GitHubApiError`, `CloudflareApiError`, `CommentError`, `EnvironmentError`, `PayloadError`, `DeployError`, … — with `message`. When one wraps a rejection, add `cause: Schema.Defect()` and a static `from(cause)` whose message comes from `errorMessage()`. Each class needs `// oxlint-disable-next-line unicorn/throw-new-error`.
- Fail with `return yield* new XError({message})`. Wrap Promise APIs in `Effect.tryPromise({try, catch: XError.from})`.
- To recover inside an `Effect.fn`, pass a pipe argument — it receives the call's arguments after the effect: `(effect, deployment) => Effect.catch(effect, …)` (`src/common/batch-delete.ts`).
- Use `raise()` (`src/common/utils.ts`) only in plain synchronous code that an `Effect.try` wraps.
- Log another tool's output (wrangler stdout) with `logVerbatim()`, not `info()` — `info` writes raw, so a `::` line would run as a workflow command.
- Prefix messages with a module-level `PREFIX` / `ERROR_KEY` (e.g. `delete -`, `GitHub Environment:`) so annotations are attributable.

## Inputs and secrets

- Parse with `readInputs(config)` (`src/common/config/provider.ts`). Never call `config.parse(actionInputProvider)` at module scope — `parse` reads the env when called, so the layer would see the import-time env.
- The provider is `ConfigProvider.fromEnvRecord(process.env)`, because the default snapshots `process.env` once and misses `vi.stubEnv`. It mirrors `getInput` naming (`INPUT_` + upper-case, spaces → `_`, **hyphens kept**: `INPUT_KEEP-LATEST`) — don't use `ConfigProvider.constantCase`.
- Declare secrets with `Config.redacted`; unwrap with `secret()` (`src/common/inputs.ts`) only at the point of use (auth header, child env). `CommonInputs.layer` registers both tokens with `setSecret`, because the runner only auto-masks `secrets.*` values.

## Decoding, polling, summaries

- Decode without throwing: `Schema.decodeUnknownOption(S)(x)` (`src/common/github/deployment/payload.ts`, `src/common/github/workflow-event/workflow-event.ts`); parse JSON text with `parseJson()` (`src/common/json.ts`), which yields `undefined` when invalid. Payload types derive from their schemas in `src/common/github/deployment/types.ts` — change the schema, not a hand-written type.
- Poll (`src/common/cloudflare/deployment/status.ts`) with `Effect.retry` (`Schedule.spaced` + `Schedule.upTo`; `while` stays a plain boolean predicate) inside an outer `Effect.timeout` (the real ceiling), then `Effect.catchTag(['DeploymentPendingError', 'TimeoutError'], …)` → `DeploymentPollTimeoutError`. Don't retry `CloudflareApiError`.
- Write job summaries with `writeSummary(build, XError.from)` (`src/common/summary.ts`). `summary.addTable` cells are raw HTML and carry PR-author text (commit messages, branch names), so build every cell with `src/common/html.ts`: `escapeHtml(text)`, `code(text)`, `link(href, html)` (http(s) only), `githubUrl(...segments)` (percent-encodes each segment).

## Lint

- Suppress `unicorn/no-array-for-each` on `Effect.forEach`.
- Use `optionalInput()` instead of `Config.withDefault(undefined)` — it carries the `unicorn/no-useless-undefined` suppression.
- Write `effect.pipe(Effect.map(f))`, not `Effect.map(effect, f)` — `unicorn/no-array-callback-reference` misreads the data-first form as `Array#map`.
