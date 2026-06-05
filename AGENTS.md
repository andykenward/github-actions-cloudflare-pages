# GitHub Actions Cloudflare Pages — AI Agent Instructions

Dual-mode GitHub Action for Cloudflare Pages. **deploy** creates deployments via the Wrangler CLI and links them to GitHub Deployments/Environments; **delete** batch-removes old deployments. TypeScript ESM, GraphQL-typed GitHub API, vitest.

## Critical Rules

Non-negotiable. Violating these breaks the build or the type system.

1. **GitHub API → GraphQL only, never REST.** Read [bin/download/](bin/download/) for the request pattern before writing any GitHub call.
2. **After editing any GraphQL operation → run `pnpm run codegen`** before type-checking or building — generated types do not exist until you do.
3. **Imports → `@/` path aliases.** Keep [tsconfig.json](tsconfig.json) `paths` in sync with [vitest.config.ts](vitest.config.ts) `resolve.alias`, or `vi.mock()` silently fails.
4. **Never hand-edit [`__generated__/`](__generated__/)** — it is rebuilt by codegen.
5. **No `console.log`** — use `@actions/core` methods (`info`, `debug`, `warning`, `error`, `setFailed`).
6. **Touch an exported function → update its tests.** Tests for `bin/` scripts live in `__tests__/scripts/` (NOT `__tests__/bin/`, which vitest excludes).
7. **Change a GraphQL selection set → update every test mock** for that operation (`grep` the operation name across `__tests__/`; multiple files may mock it).
8. **Run scripts with the right runner**: `node` runs scripts whose only **runtime** imports are `node:*` / relative / `package.json` / npm packages / type-only `@/` aliases (type-only imports are erased, so they're fine). `tsx` is required for any script that **transitively imports the generated GraphQL client** (`__generated__/gql/`) — see [Build & Tooling](#build--tooling).

## Architecture

| Path                                             | Role                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [src/deploy/index.ts](src/deploy/index.ts)       | Deploy entry → bundled to [dist/deploy/index.js](dist/deploy/index.js) → consumed by [action.yml](action.yml)               |
| [src/delete/index.ts](src/delete/index.ts)       | Delete entry → bundled to [dist/delete/index.js](dist/delete/index.js) → consumed by [delete/action.yml](delete/action.yml) |
| [src/common/](src/common/)                       | Shared logic for both actions (GitHub API, Cloudflare deploy, batch ops)                                                    |
| [src/common/github/](src/common/github/)         | GitHub API: deployments, comments, environments                                                                             |
| [src/common/cloudflare/](src/common/cloudflare/) | Cloudflare Pages API + deployment logic                                                                                     |
| [`__generated__/`](__generated__/)               | Generated — never edit (gql types, webhook payloads, API responses)                                                         |
| [`__fixtures__/`](__fixtures__/)                 | Manually maintained test data                                                                                               |
| [`__tests__/`](__tests__/)                       | Mirrors `src/` with `.test.ts` suffix                                                                                       |

**GraphQL type safety**: Inline ``graphql(/* GraphQL */ `...`)`` operations in `src/**` and `bin/**` are typed via [@graphql-codegen/client-preset](graphql.config.ts). The custom client [src/common/github/api/client.ts](src/common/github/api/client.ts) wraps fetch with `TypedDocumentString` for compile-time validation. Preview features come from [schema/github/schema.graphql](schema/github/schema.graphql).

**Cloudflare**: Runs `wrangler pages deploy` via `execAsync()` ([src/common/cloudflare/deployment/create.ts](src/common/cloudflare/deployment/create.ts#L49-L54)). Wrangler is external to the bundle (esbuild `external`, [esbuild.config.js](esbuild.config.js)) and installed at runtime via `npx wrangler@<version>` — the version comes from the `wrangler-version` input or, failing that, the default in [src/common/inputs.ts](src/common/inputs.ts), which [bin/sync-versions.ts](bin/sync-versions.ts) keeps in lockstep with `devDependencies.wrangler` (the single source of truth; tests read it too). Deployment status polling and deletion use Cloudflare's REST API.

## Commands

| Command                        | Purpose                                                                                                       |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| `pnpm run all`                 | Full validation: sync-versions → knip → codegen → codegen:events → tsc → format → lint → test → build         |
| `pnpm run build`               | ESBuild bundle to `dist/deploy` & `dist/delete`                                                               |
| `pnpm run codegen`             | Regenerate GraphQL types in [`__generated__/gql/`](__generated__/gql/) from inline `graphql()` calls          |
| `pnpm run codegen:events`      | Generate GitHub event types via [bin/codegen/index.ts](bin/codegen/index.ts) from `@octokit/webhooks-schemas` |
| `pnpm run codegen:watch`       | Auto-regenerate types on GraphQL changes                                                                      |
| `pnpm run tsc:check`           | Type-check (`tsc --noEmit --checkJs`)                                                                         |
| `pnpm run test` / `test:watch` | Vitest run / interactive                                                                                      |
| `pnpm run start`               | Run the built action locally (needs local env vars)                                                           |
| `pnpm run act:d`               | Test the delete action locally with `act`                                                                     |
| `pnpm changeset`               | Record a changeset for notable/breaking changes                                                               |

## Task Playbooks

**Add a GitHub API operation**

1. Write a ``graphql(/* GraphQL */ `...`)`` operation in the appropriate file (read [bin/download/](bin/download/) for the pattern first).
2. `pnpm run codegen` — types won't exist until you do.
3. Import generated types from [`__generated__/gql/graphql.ts`](__generated__/gql/graphql.ts); call via the typed `request()` client.
4. If a scalar appears as `any` in generated output, add a mapping in [graphql.config.ts](graphql.config.ts) and re-run codegen.

**Change a GraphQL selection set**

1. Edit the operation → `pnpm run codegen`.
2. Update **every** test mock response for that operation — `grep` the operation name across `__tests__/`.

**Add an action input**

1. Add the input to [action.yml](action.yml) or [delete/action.yml](delete/action.yml).
2. Add `INPUT_KEY_*` in [input-keys.ts](input-keys.ts) (and `INPUT_KEYS_REQUIRED` if mandatory).
3. Handle it in `inputs.ts`. Optional inputs: normalise empty-string to `undefined` (`getInput(KEY, {required: false}) || undefined`) so the `Inputs` field is truly optional.
4. Tests: `stubRequiredInputEnv()` only stubs `INPUT_KEYS_REQUIRED`, so a **required** input is covered automatically. An **optional** input is not — stub it per-test with `stubInputEnv(INPUT_KEY_X, value)` and assert the `undefined` default case too (see [`__tests__/deploy/inputs.test.ts`](__tests__/deploy/inputs.test.ts)).
5. Document it in the Inputs table of [README.md](README.md) (or [delete/README.md](delete/README.md) for the delete action).

**Cloudflare API change**: update types in [src/common/cloudflare/types.ts](src/common/cloudflare/types.ts) → add fixtures to [`__generated__/responses/`](__generated__/responses/).

**Breaking change**: `pnpm changeset` to record it for [CHANGELOG.md](CHANGELOG.md).

## Conventions

**GraphQL operations**

- Always use the ``graphql(/* GraphQL */ `...`)`` template tag (required for codegen detection).
- Prefix mutations `MutationCreateGitHubDeployment`; prefix fragments `EnvironmentFragment`.
- **Fragment placement**: keep fragment definitions in `**/fragments.ts`. Knip ignores `src/**/fragments.ts` ([knip.json](knip.json)) so exports codegen uses without a TS import don't trip dead-code detection. Do NOT move a fragment into an implementation file — it triggers an unused-local/export violation. A fragment used in one subdomain still lives in a peer `fragments.ts` (e.g. [src/common/github/deployment/fragments.ts](src/common/github/deployment/fragments.ts)); fragments shared across subdirectories go in [src/common/github/fragments.ts](src/common/github/fragments.ts).
- **Fragment resolution**: codegen resolves `...FragmentName` spreads by scanning all project files (no TS import needed in operation files) and inlines the full definition into each operation's `TypedDocumentString` ([`__generated__/gql/graphql.ts`](__generated__/gql/graphql.ts)).

**Error handling**: use `raise()` for inline errors with type narrowing — `const {name} = (await checkEnvironment()) ?? raise('Environment required')`. See [src/common/utils.ts](src/common/utils.ts).

**Testing**

- Global setup [vitest.setup.ts](vitest.setup.ts) stubs required env + input env vars before each test.
- [`__mocks__/@actions/core.ts`](__mocks__/@actions/core.ts) provides `vi.fn()` wrappers for all `@actions/core` methods.
- HTTP: undici `MockAgent` (see [`__tests__/helpers/api.ts`](__tests__/helpers/api.ts)); assert `mockApi.mockAgent.assertNoPendingInterceptors()` to catch missed calls.
- Helpers: `stubTestEnvVars()` ([`__tests__/helpers/env.ts`](__tests__/helpers/env.ts)), `stubRequiredInputEnv()` ([`__tests__/helpers/inputs.ts`](__tests__/helpers/inputs.ts)). Fixtures: [`__generated__/payloads/`](__generated__/payloads/), [`__generated__/responses/`](__generated__/responses/).
- `vi.mock(import('@/...'))` — always use path aliases to match vitest aliases. `vi.mock(import('@actions/core'))` auto-loads the `__mocks__` file.
- Use `describe(functionName)` with the actual function reference for IDE navigation.

**Docs & containers**

- **Keep user-facing docs in sync**: [README.md](README.md) documents the deploy action ([action.yml](action.yml)); [delete/README.md](delete/README.md) documents the delete action ([delete/action.yml](delete/action.yml)). When you add, change, or remove an input or output — or change user-visible behavior — update the matching Inputs/Outputs table and examples in the corresponding README. The pinned `andykenward/...@<sha> #vX.Y.Z` action refs in both are kept current by [bin/sync-readme-versions.ts](bin/sync-readme-versions.ts); don't hand-edit the SHA or version.
- **Markdown paths**: wrap `__dunder__` path tokens in backticks — e.g. ``[`__generated__/`](__generated__/)`` — because the formatter reads a bare `__x__` as bold emphasis and can mangle both the link text and its target.
- **Dockerfiles** ([.devcontainer/Dockerfile](.devcontainer/Dockerfile)): keep logically distinct steps in separate `RUN` blocks. Don't merge blocks when it adds complexity (e.g. extra bootstrap or a second `apt-get update` just to consolidate) — favor clarity over layer minimisation.

## Build & Tooling

- **Versions**: Node via `engines`, pnpm via `packageManager` — both in [package.json](package.json).
- **`node` vs `tsx`**: prefer `node path/to/script.ts` (native type-stripping, no extra dep). What matters is a script's **runtime** imports, not every import: `node` is fine when those are only `node:*`, relative paths, `package.json`, npm packages, or **type-only** `@/` aliases — `import type` is stripped, so the alias never resolves at runtime (e.g. `node bin/deployments/index.ts`, whose sole `@/` import is `import type`). Use `tsx path/to/script.ts` for any script that **transitively imports the generated GraphQL client** (`__generated__/gql/`), e.g. `tsx bin/sync-readme-versions.ts`. Two things in `__generated__/gql/` break native `node`, and neither is hand-fixable (never edit generated files): (1) `graphql.ts` emits `export enum` — node's `--experimental-strip-types` rejects enums (`--experimental-transform-types` would handle them but not #2); (2) `gql.ts` has a runtime `import * as types from './graphql.js'` (the `types.*Document` values populate its `documents` map), and node won't remap `.js`→`.ts`. `tsx` handles both: it reads `tsconfig.json` paths, transforms enums, and resolves `.js`→`.ts` through the whole chain. `verbatimModuleSyntax` does not change this — node doesn't read tsconfig, and the `gql.ts` import is a real value import. Note also that `#`-prefixed subpath imports only redirect the entry import, not relative `.js` imports inside loaded files.
- **Bin script pattern**: a `bin/` script that must be both importable (for tests) and directly executable wraps side-effectful code in `if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)` and exports the pure functions. Reference: [bin/sync-readme-versions.ts](bin/sync-readme-versions.ts).
- **ESBuild** ([esbuild.config.js](esbuild.config.js)): banner adds a `createRequire` shim for dynamic-require compatibility ([esbuild.config.js](esbuild.config.js#L22-L35)); `wrangler` is external; minification is syntax + whitespace only (identifiers preserved for debugging); sourcemaps enabled.
- **Sequencing**: run `pnpm run codegen` after GraphQL changes before building; update [input-keys.ts](input-keys.ts) after changing input keys in [action.yml](action.yml).
- **Debugging**: `pnpm run start` runs the built action locally; add `debugger` statements and run vitest under the Node inspector.
- **Code quality**: Knip dead-code detection ([knip.json](knip.json), ignores `__generated__`, fragments, wrangler, act); Oxlint ([.oxlintrc.json](.oxlintrc.json)); TypeScript strict mode (`verbatimModuleSyntax`, `noEmit`, `checkJs`).
- **Line anchors**: a few links here use line numbers (e.g. `create.ts#L49-L54`, `esbuild.config.js#L22-L35`). When you edit code at one of those locations, update the line number in this file.

## Dev Environment Hooks

Formatting, linting, and type-checking are automated via [prek](https://prek.j178.dev) (`prek.toml`) and Claude Code hooks ([.claude/settings.json](.claude/settings.json), scripts in [.claude/scripts/](.claude/scripts/)).

- **Hook Sync Rule**: when changing formatter/linter behavior or script paths, update together — the `oxc-format-and-lint` local hook in [prek.toml](prek.toml), the PostToolUse hook in [.claude/settings.json](.claude/settings.json), and the usage header in [.claude/scripts/pre-commit-oxc.sh](.claude/scripts/pre-commit-oxc.sh).
- **Format + lint after edits**: [.claude/scripts/format-and-lint-after-edit.sh](.claude/scripts/format-and-lint-after-edit.sh) runs oxfmt + oxlint on each edited file and feeds lint errors back to the agent.
- **Type-check after edits**: [.claude/scripts/type-check-after-edit.sh](.claude/scripts/type-check-after-edit.sh) runs `pnpm run tsc:check` asynchronously (the `asyncRewake` PostToolUse hook); type errors wake the agent without blocking the edit.
- **Session-end review on stop**: [.claude/scripts/stop-review-agents.sh](.claude/scripts/stop-review-agents.sh) (Stop hook) prompts capturing session learnings in AGENTS.md (shared repo conventions) and auto-memory (user preferences + project context) when the working tree has changes.

## GitHub Actions Integration

- GitHub Environments must be created manually (the action lacks permission to create them).
- `GITHUB_TOKEN` permissions: `actions:read`, `contents:read`, `deployments:write`, `pull-requests:write`.
- Supported events only: `push`, `pull_request`, `workflow_dispatch`, `workflow_run` (validated in [src/deploy/main.ts](src/deploy/main.ts)).
- The deployment payload embeds Cloudflare metadata so the delete workflow can find deployments ([src/common/github/deployment/types.ts](src/common/github/deployment/types.ts)).
- **`workflow_run` + fork PRs**: `github.event.workflow_run.pull_requests` is **empty for pull requests from forks** ([community #25220](https://github.com/orgs/community/discussions/25220)). Never derive `pr-number` or `branch` from `pull_requests[0].number` in docs/examples — it silently resolves to empty for the exact fork case those examples target. Instead save the number in the triggering `pull_request` workflow and read it from an artifact (`upload-artifact` → `download-artifact` with `run-id: ${{ github.event.workflow_run.id }}` + `github-token`). See the "Custom branch name" example in [README.md](README.md).

## Resources

- [README.md](README.md) — user-facing docs for the deploy action.
- [delete/README.md](delete/README.md) — user-facing docs for the delete action.
- [CHANGELOG.md](CHANGELOG.md) — changes and breaking changes.
