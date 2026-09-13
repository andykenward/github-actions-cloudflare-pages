---
paths:
  - 'src/**/*.ts'
  - 'bin/**/*.ts'
  - '__tests__/**/*.ts'
  - '.oxlintrc.json'
---

# TigerStyle

[TigerBeetle's TIGER_STYLE](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md) — safety first, then performance, then developer experience — adapted to TypeScript and Effect. Where oxlint has a rule for a principle, `.oxlintrc.json` enables it (table at the end); the rest is enforced by review.

## Functions

- A function is at most **70 raw lines**, comments and blanks included (`max-lines-per-function`): it has to fit on a screen. `Effect.fn` bodies count; their pipe arguments don't. An IIFE counts as a function — prefer a named top-level helper.
- Split by moving **non-branchy** fragments out, named `<caller><What>` (`getGitHubContextRepo` for a piece of `getGitHubContext`). Keep the `if`/`switch` in the parent: push conditionals up, loops down. A helper that branches as much as its caller has moved the problem, not solved it.
- Callbacks go last in a parameter list. At most 4 parameters (`max-params`); pass an object beyond that.

## Bounds

- Every loop has a fixed upper bound: `for (let index = 0; index < X_COUNT_MAX; index++)` or `Effect.forEach` over an array whose length something else already bounded. No `while (true)`, no `while (next)` following a server's cursor without a cap.
- Every schedule is bounded both ways: `Schedule.upTo({duration, times})` — a zero interval (tests) or a stalled clock defeats a duration alone. With `retry`/`repeat` the effect runs `times + 1` times: the first evaluation precedes the first schedule step.
- Every child process and fetch runs under an `Effect.timeout` whose `TimeoutError` is mapped (`Effect.catchTag`) to the module's tagged error, as `statusCloudflareDeployment` does in `src/common/cloudflare/deployment/status.ts`.
- Name a bound `X_COUNT_MAX` / `X_MINUTES` as a plain `const`, or a `Context.Reference` named `XMax` when tests need to shrink it (like `PollInterval` in `src/common/cloudflare/deployment/status.ts`). Comment how the number was chosen.
- Exceeding a bound on **external** data (pages GitHub keeps sending, a Cloudflare error chain) fails with the module's `Schema.TaggedError`, message naming the bound. Exceeding an **internal** bound is a bug: `assert.fail`.
- Bound numeric inputs above as well as below — `Schema.Natural.check(Schema.isLessThanOrEqualTo(X_MAX))` — and say in the comment what the maximum protects.

## No recursion

- Walk a tree with an explicit stack and a node-count bound. Loop as `for (let node = stack.pop(); node !== undefined; node = stack.pop())` — a `while (stack.length > 0)` plus a pop-then-check leaves an unreachable branch. Push children in reverse so the visit order matches the recursion it replaces (`bin/codegen/cloudflare-pages.ts` writes `used` out in that order; `pnpm run codegen:cloudflare` must yield no diff). A `Schema.suspend` schema may be recursive (it is declarative); the code that walks its values may not (`renderError` in `src/common/cloudflare/api/error.ts` walks `error_chain`).

## Assertions

- `import assert from 'node:assert/strict'`; call `assert.ok`, `assert.equal`, `assert.match`, `assert.doesNotMatch`, `assert.fail`. Never bare `assert(x)` (`unicorn/consistent-assert`). One property per call: `assert.ok(a); assert.ok(b)`, not `assert.ok(a && b)`.
- Assert the arguments at the top of a function and the result just before `return`; at least two per function you touch. Assert both what must hold and what must not (`assert.doesNotMatch(escaped, /[<>"']/)`). Pair them: the same property checked from two code paths (the entry points skip `reportFailure` for an interrupt-only cause; `reportFailure` asserts it never sees one).
- Inside `Effect.gen` / `Effect.fn` a failed assertion throws, which Effect records as a defect: `reportFailure` prints its message with `setFailed` and the stack with `debug` (`__tests__/common/errors.test.ts`). Never `Effect.catch` one — `catch`/`catchTag` see only typed failures, so an assertion can't be swallowed by row-level recovery either. Use `Effect.die` only in a pipe callback where a `throw` is awkward.
- Schemas are the assertions on **external** data (inputs, payloads, API bodies) and produce typed failures; `assert` is for invariants the code itself guarantees. Runner environment variables are external too: `src/common/github/context.ts` checks them with `raise()` and a message naming the variable (`GITHUB_SHA` must be 40 hex), then asserts the built context as the pair. Don't assert a format the fixtures fake without upgrading the fixture first.
- `bin/` scripts use `node:assert` directly; they run under plain `node` (see `tooling.md`).
- Every `switch` on a tag union is exhaustive (`switch-exhaustiveness-check`), with `default: { return assert.fail('unknown …') }` so a new tag fails loudly at runtime too.

## Explicit errors

- Handle every failure: no `Effect.ignore`, no `Effect.orElseSucceed`, no `catch: () => undefined`, no empty `catch`. Recover only through `Effect.catchTag` / `Effect.catchReason` on a named tag, and log what was tolerated — `debug` when a user can't act on it, `warning` when they can.
- Wrap a caught error: `new Error(message, {cause})`, never `new Error(message)` alone.
- An API that "never fails" returns an outcome carrying the reason (`{success: false, error}` rows in `src/common/batch-delete.ts`), not a boolean.
- Check a response's shape before an `as` cast, and comment what the remaining cast asserts at compile time.

## Control flow and scope

- One ternary, never nested (`no-nested-ternary`); braces on every `if` (`curly`); no `else` after `return` (`no-else-return`); at most three levels of nesting (`max-depth`).
- Declare a variable in the branch that uses it, as close to the use as possible. Don't alias a value under a second name.
- State invariants positively: `index < count`, not `!(index >= count)`.

## Naming

- camelCase / PascalCase / `UPPER_SNAKE` as TypeScript does; not snake_case (see below). `unicorn/filename-case` governs file names.
- No abbreviations: `response` not `res`, `pullRequestNumber` not `prNumber`, `directory` not `dir`. Exceptions: GitHub's own vocabulary (`sha`, `repo`, `ref`, `id`, `url`) and Effect's type parameters (`A`, `E`, `R`, `T`, `V` — the `id-length` exceptions).
- Qualifiers last, by descending significance: `PollCountMax`, `failedCount`, `WRANGLER_VERSION_DEFAULT`, `ERROR_CHAIN_NODE_COUNT_MAX`. A field that mirrors an action input keeps the input's name (`keepLatest`).
- Say which it is: an `index` is 0-based, a `count` is 1-based, a `size` is in bytes. Never mix them in one name.
- A helper used by one caller is prefixed with the caller's name (`pollOnce` under `statusCloudflareDeployment` predates this rule; new helpers follow it).

## Comments

- Say why, not what; the code says what. Full sentences: capital letter, full stop.
- No `TODO` / `FIXME` / `HACK` (`no-warning-comments`) — open an issue and link it, or do it now.
- Explain the choice of every bound and every tolerated error next to it.

## Dependencies

- Three runtime dependencies: `effect`, `@actions/core`, `openapi-fetch`. A fourth needs a reason in the PR; every one is bundled into `dist/` and is a supply-chain surface. Dev dependencies follow `tooling.md`.

## Not adopted, and why

- **snake_case**: the TypeScript ecosystem, `unicorn/filename-case`, and GraphQL / JSON field names (`node_id`, `per_page`) would all fight it.
- **Static allocation, sized integers**: a garbage-collected runtime; the bounds above cover the intent (no unbounded growth).
- **100 columns**: oxfmt's `printWidth: 80` is stricter and formatter-enforced. Keep it.
- **Zig for tooling**: `pnpm run all` is the single toolbox; `bin/` scripts are TypeScript run with `node`.
- **`main` first in a file**: `index.ts → main.ts` already puts the entry first; inside a module a `const` must precede its use, so files read helpers-then-`run`.
- **Assert every argument**: relaxed for an `Effect.fn` whose arguments come from a `Schema`-validated service — the schema already asserted them.

## Lint mapping

The rules that enforce the principles above, with their options and the overrides `.oxlintrc.json` carries for them. Tests are exempt from the length and nesting rules because `describe` → `it` → `Effect.gen` → mock callback is their structure, not logic; `vitest/max-nested-describe` still bounds them.

| Rule                                             | Principle                     | Overrides                                       |
| ------------------------------------------------ | ----------------------------- | ----------------------------------------------- |
| `max-lines-per-function` 70, raw                 | Functions fit on a screen     | off in `__tests__/**` (`describe`/`it` nesting) |
| `max-depth` 3, `max-nested-callbacks` 4          | Push conditionals up          | `max-nested-callbacks` off in `__tests__/**`    |
| `max-params` 4                                   | Fewer things in scope         |                                                 |
| `no-nested-ternary`, `curly`, `no-else-return`   | Simple, explicit control flow |                                                 |
| `no-magic-numbers`                               | Every bound is named          | off in `__tests__/**`, `__fixtures__/**`        |
| `@typescript-eslint/switch-exhaustiveness-check` | Assert the negative space     |                                                 |
| `no-warning-comments`                            | Zero technical debt           |                                                 |
| `id-length` 2                                    | No abbreviations              | `A E R T V` type parameters                     |
| `unicorn/consistent-assert` (already on)         | `assert.ok`, never bare       |                                                 |
