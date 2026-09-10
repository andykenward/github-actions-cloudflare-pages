# GitHub Actions Cloudflare Pages — AI Agent Instructions

Dual-mode GitHub Action for Cloudflare Pages. **deploy** creates deployments via the Wrangler CLI and links them to GitHub Deployments/Environments; **delete** batch-removes old deployments. TypeScript ESM, Effect, GraphQL-typed GitHub API, vitest.

## Critical Rules

Non-negotiable. Violating these breaks the build or the type system.

1. **GitHub API → GraphQL only, never REST.** Read [bin/download/](bin/download/) for the request pattern first.
2. **After editing any GraphQL operation → `pnpm run codegen`** before type-checking or building — generated types do not exist until you do.
3. **Imports → `@/` path aliases.** Keep [tsconfig.json](tsconfig.json) `paths` in sync with [vitest.config.ts](vitest.config.ts) `resolve.alias`, or `vi.mock()` silently fails.
4. **Never hand-edit [`__generated__/`](__generated__/)** — it is rebuilt by codegen.
5. **No `console.log`** — use `@actions/core` (`info`, `debug`, `warning`, `error`, `setFailed`).
6. **Touch an exported function → update its tests.** Tests for `bin/` scripts live in `__tests__/scripts/` (NOT `__tests__/bin/`, which vitest excludes).
7. **Change a GraphQL selection set → update every test mock** for that operation (`grep` the operation name across `__tests__/`; multiple files may mock it).
8. **Run scripts with the right runner** — `node` normally, `tsx` for anything that transitively imports `__generated__/gql/`; see [Build & Tooling](#build--tooling).

## Architecture

| Path                                             | Role                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [src/deploy/index.ts](src/deploy/index.ts)       | Deploy entry → bundled to [dist/deploy/index.js](dist/deploy/index.js) → consumed by [action.yml](action.yml)               |
| [src/delete/index.ts](src/delete/index.ts)       | Delete entry → bundled to [dist/delete/index.js](dist/delete/index.js) → consumed by [delete/action.yml](delete/action.yml) |
| [src/common/](src/common/)                       | Shared logic (GitHub API, Cloudflare deploy, batch ops)                                                                     |
| [src/common/github/](src/common/github/)         | GitHub API: deployments, comments, environments                                                                             |
| [src/common/cloudflare/](src/common/cloudflare/) | Cloudflare Pages API + deployment logic                                                                                     |
| [`__generated__/`](__generated__/)               | Generated — never edit (gql types, webhook payloads, API responses)                                                         |
| [`__fixtures__/`](__fixtures__/)                 | Manually maintained test data                                                                                               |
| [`__tests__/`](__tests__/)                       | Mirrors `src/` with `.test.ts` suffix                                                                                       |

**GraphQL type safety**: inline ``graphql(/* GraphQL */ `...`)`` operations in `src/**` and `bin/**` are typed via [@graphql-codegen/client-preset](graphql.config.ts). The custom client [src/common/github/api/client.ts](src/common/github/api/client.ts) wraps fetch with `TypedDocumentString` for compile-time validation. Preview features come from [schema/github/schema.graphql](schema/github/schema.graphql).

**Cloudflare**: `wrangler pages deploy` runs via `execAsync()` ([create.ts](src/common/cloudflare/deployment/create.ts#L49-L54)). Wrangler is external to the bundle ([esbuild.config.js](esbuild.config.js)) and installed at runtime via `npx wrangler@<version>` — from the `wrangler-version` input or the default in [src/common/inputs.ts](src/common/inputs.ts), which [bin/sync-versions.ts](bin/sync-versions.ts) keeps in lockstep with `devDependencies.wrangler` (single source of truth; tests read it too). Status polling and deletion use the typed [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) client [api/client.ts](src/common/cloudflare/api/client.ts); the `{success, result, errors}` envelope is unwrapped by `unwrap`/`unwrapSuccess` in [fetch-result.ts](src/common/cloudflare/api/fetch-result.ts), which owns envelope error handling. [endpoints.ts](src/common/cloudflare/api/endpoints.ts) only builds the `dash.cloudflare.com` log URL.

## Commands

| Command                        | Purpose                                                                                                                                |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run all`                 | Full validation: sync-versions → knip → codegen → codegen:events → codegen:cloudflare → tsc → format → lint → test → build             |
| `pnpm run build`               | ESBuild bundle to `dist/deploy` & `dist/delete`                                                                                        |
| `pnpm run codegen`             | Regenerate GraphQL types in [`__generated__/gql/`](__generated__/gql/) from inline `graphql()` calls                                   |
| `pnpm run codegen:cloudflare`  | Cloudflare Pages types via [bin/codegen/cloudflare-pages.ts](bin/codegen/cloudflare-pages.ts)                                          |
| `pnpm run codegen:events`      | GitHub event types via [bin/codegen/github-workflow-events.ts](bin/codegen/github-workflow-events.ts) from `@octokit/openapi-webhooks` |
| `pnpm run codegen:watch`       | Auto-regenerate types on GraphQL changes                                                                                               |
| `pnpm run tsc:check`           | Type-check (`tsc --noEmit --checkJs`)                                                                                                  |
| `pnpm run test` / `test:watch` | Vitest run / interactive                                                                                                               |
| `pnpm run start`               | Run the built action locally (needs local env vars)                                                                                    |
| `pnpm run act:d`               | Test the delete action locally with `act`                                                                                              |
| `pnpm changeset`               | Record a changeset for notable/breaking changes                                                                                        |

## Task Playbooks

**Add a GitHub API operation**: write the ``graphql(/* GraphQL */ `...`)`` operation (pattern: [bin/download/](bin/download/)) → `pnpm run codegen` → import types from [`__generated__/gql/graphql.ts`](__generated__/gql/graphql.ts) and call via the typed `request()` client. A scalar generated as `any` needs a mapping in [graphql.config.ts](graphql.config.ts) plus a re-run.

**Change a GraphQL selection set**: edit → `pnpm run codegen` → update **every** test mock for that operation (`grep` the operation name across `__tests__/`).

**Add an action input**

1. Add it to [action.yml](action.yml) or [delete/action.yml](delete/action.yml).
2. Add `INPUT_KEY_*` in [input-keys.ts](input-keys.ts) (and `INPUT_KEYS_REQUIRED` if mandatory).
3. Handle it in `inputs.ts`. Optional inputs: normalise empty-string to `undefined` (`getInput(KEY, {required: false}) || undefined`).
4. Tests: `stubRequiredInputEnv()` covers **required** inputs automatically. An **optional** input is not — stub it per-test with `stubInputEnv(INPUT_KEY_X, value)` and assert the `undefined` default (see [`__tests__/deploy/inputs.test.ts`](__tests__/deploy/inputs.test.ts)).
5. Document it in the Inputs table of the matching README.

**Cloudflare API change**: Pages types are generated from Cloudflare's canonical OpenAPI schema — edit the operation whitelist in [bin/codegen/cloudflare-pages.ts](bin/codegen/cloudflare-pages.ts) → `pnpm run codegen:cloudflare` → consume `components['schemas'][...]` re-exported from [types.ts](src/common/cloudflare/types.ts) (e.g. `PagesDeployment`). Never hand-edit [`__generated__/types/cloudflare/`](__generated__/types/cloudflare/); add fixtures to [`__generated__/responses/`](__generated__/responses/).

**Call a new Pages REST endpoint**: whitelist + codegen (above), then `cloudflareClient.GET/POST/DELETE('/accounts/{account_id}/...', {params: {path, query}})` and unwrap with `unwrap()` (typed `result`, throws on failure) or `unwrapSuccess()` (boolean). Auth is injected once by client middleware — never set headers per-call. Mock with `interceptCloudflare(path, response, status, method)` ([`__tests__/helpers/api.ts`](__tests__/helpers/api.ts)).

**Breaking change**: `pnpm changeset` to record it for [CHANGELOG.md](CHANGELOG.md).

## Conventions

**GraphQL operations**

- Always use the ``graphql(/* GraphQL */ `...`)`` template tag (required for codegen detection).
- Prefix mutations `MutationCreateGitHubDeployment`; prefix fragments `EnvironmentFragment`.
- **Fragment placement**: fragment definitions live in `**/fragments.ts` — knip ignores those ([knip.json](knip.json)) so codegen-only exports don't trip dead-code detection. Moving a fragment into an implementation file triggers an unused-export violation. Subdomain fragments go in a peer `fragments.ts` (e.g. [github/deployment/fragments.ts](src/common/github/deployment/fragments.ts)); cross-directory ones in [github/fragments.ts](src/common/github/fragments.ts).
- **Fragment resolution**: codegen resolves `...FragmentName` spreads by scanning all project files (no TS import needed) and inlines them into each operation's `TypedDocumentString`.

**Error handling**: `raise()` for inline errors with type narrowing — `const {name} = (await checkEnvironment()) ?? raise('Environment required')`. See [src/common/utils.ts](src/common/utils.ts).

**Testing**

- [vitest.setup.ts](vitest.setup.ts) stubs required env + input env vars before each test; [`__mocks__/@actions/core.ts`](__mocks__/@actions/core.ts) provides `vi.fn()` wrappers for all `@actions/core` methods.
- HTTP: undici `MockAgent` ([`__tests__/helpers/api.ts`](__tests__/helpers/api.ts)); assert `mockApi.mockAgent.assertNoPendingInterceptors()` to catch missed calls.
- **Never bump `undici` across a major.** It is pinned to Node's bundled major on purpose ([.github/dependabot.yml](.github/dependabot.yml) ignores its majors). `setGlobalDispatcher()` and Node's built-in `fetch` find each other through a versioned global symbol (`Symbol.for('undici.globalDispatcher.N')`); undici 8 bumped it to `.2` while Node 24 reads `.1`, so `MockAgent` **silently stops intercepting** and tests hit the real network — failing with genuine API responses, not connection errors. Check `process.versions.undici`; only raise the major once Node's bundled major moves.
- Helpers: `stubTestEnvVars()` ([env.ts](__tests__/helpers/env.ts)), `stubRequiredInputEnv()` ([inputs.ts](__tests__/helpers/inputs.ts)). Fixtures: [`__generated__/payloads/`](__generated__/payloads/), [`__generated__/responses/`](__generated__/responses/).
- `vi.mock(import('@/...'))` — always path aliases, to match vitest aliases. `vi.mock(import('@actions/core'))` auto-loads the `__mocks__` file.
- Use `describe(functionName)` with the actual function reference for IDE navigation.

**Docs**

- **Keep user-facing docs in sync**: [README.md](README.md) documents the deploy action; [delete/README.md](delete/README.md) the delete action. Adding, changing or removing an input/output — or any user-visible behavior — means updating the matching Inputs/Outputs table and examples. The pinned `andykenward/...@<sha> #vX.Y.Z` refs are maintained by [bin/sync-readme-versions.ts](bin/sync-readme-versions.ts); don't hand-edit the SHA or version.
- **Markdown paths**: wrap `__dunder__` path tokens in backticks — e.g. ``[`__generated__/`](__generated__/)`` — or the formatter reads `__x__` as bold emphasis and mangles link text and target.

## Build & Tooling

- **Versions**: Node via `engines`, pnpm via `packageManager` — both in [package.json](package.json).
- **TypeScript 6 + 7 side by side**: TS 7 (Go-native) ships **no programmatic API** until 7.1, so [package.json](package.json) installs both under npm aliases — `"@typescript/native": "npm:typescript@7"` supplies the `tsc` binary used by `tsc:check` / `tsc:ls` / CI, and `"typescript": "npm:@typescript/typescript6@6"` keeps the 6.0 API on the `typescript` specifier for tools that `import ts from 'typescript'` (`openapi-typescript`, and `cosmiconfig` via `graphql-config` loading [graphql.config.ts](graphql.config.ts)), plus a `tsc6` binary. Bump them independently; never collapse to one dependency until 7.1 ships the API. `knip` (oxc-parser) and `oxlint-tsgolint` need neither.
- **`@effect/tsgo`**: the Effect language service is delivered by patching binaries in place, not a separate LSP. `prepare` runs `effect-tsgo patch --typescript --oxlint` on every install, patching the platform `tsc` under `@typescript/native` and the `oxlint` / `oxlint-tsgolint` binaries (`effect-tsgo unpatch` reverses it). **Effect diagnostics come from `pnpm run lint`, not `tsc:check`** — the `@effect/language-service` plugin in [tsconfig.json](tsconfig.json) sets `"diagnostics": false` so the passes don't double-report ([docs](https://effect.website/docs/v4/getting-started/devtools#oxlint)). [.oxlintrc.json](.oxlintrc.json) extends only the `correctness` + `antipattern` presets from `node_modules/@effect/tsgo/oxlint-presets/` and adds `effecttsgo` to `plugins`; `effect-native`, `style` and `recommended` are deliberately excluded (~140 warnings on every `async` function, `process.env` read and `node:*` import). Preset rules are `warn` and `lint` has no `--max-warnings`, so they don't fail CI. The plugin name is not an installed package (it lives inside `@effect/tsgo`) — hence the `ignoreDependencies` entry in [knip.json](knip.json). The oxlint patch is version-coupled: bump `@effect/tsgo`, `oxlint` and `oxlint-tsgolint` together and re-run `pnpm install`. Standalone: `pnpm exec effect-tsgo diagnostics --project tsconfig.json`.
- **`node` vs `tsx`**: prefer `node path/to/script.ts` (native type-stripping, no extra dep) — fine when a script's **runtime** imports are only `node:*`, relative paths, `package.json`, npm packages, or **type-only** `@/` aliases (`import type` is stripped, so the alias never resolves at runtime — e.g. `node bin/deployments/index.ts`). Use `tsx` for any script that transitively imports `__generated__/gql/` (e.g. `tsx bin/sync-readme-versions.ts`): `graphql.ts` emits `export enum`, which `--experimental-strip-types` rejects, and `gql.ts` has a runtime `import * as types from './graphql.js'` that node won't remap `.js`→`.ts`. Neither is hand-fixable (generated files). `tsx` reads tsconfig paths, transforms enums and remaps extensions. `verbatimModuleSyntax` doesn't change this; `#`-prefixed subpath imports only redirect the entry import.
- **Bin script pattern**: a `bin/` script that is both importable (tests) and executable wraps side effects in `if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)` and exports pure functions. Reference: [bin/sync-readme-versions.ts](bin/sync-readme-versions.ts).
- **ESBuild** ([esbuild.config.js](esbuild.config.js)): banner adds a `createRequire` shim ([L22-L35](esbuild.config.js#L22-L35)); `wrangler` external; minification is syntax + whitespace only (identifiers preserved); sourcemaps on.
- **Sequencing**: `pnpm run codegen` after GraphQL changes before building; update [input-keys.ts](input-keys.ts) after changing input keys in [action.yml](action.yml).
- **Debugging**: `pnpm run start` runs the built action locally; add `debugger` statements and run vitest under the Node inspector.
- **Code quality**: knip ([knip.json](knip.json)), oxlint ([.oxlintrc.json](.oxlintrc.json)), TypeScript strict (`verbatimModuleSyntax`, `noEmit`, `checkJs`).
- **Line anchors**: some links here use line numbers (`create.ts#L49-L54`, `esbuild.config.js#L22-L35`) — update them when editing that code.

## Dev Environment Hooks

Formatting and linting are automated via [prek](https://prek.j178.dev) (`prek.toml`) and Claude Code hooks ([.claude/settings.json](.claude/settings.json), scripts in [.claude/scripts/](.claude/scripts/)).

- **CI**: [prek.yml](.github/workflows/prek.yml) runs `prek run --all-files` on PRs and `main` (it replaced pre-commit.ci, which can't read `prek.toml`). Pin its `prek-version` to the prek in [.devcontainer/Dockerfile](.devcontainer/Dockerfile).
- **Hook Sync Rule**: change formatter/linter behavior or script paths → update the `oxc-format-and-lint` hook in [prek.toml](prek.toml) and the usage header in [.claude/scripts/pre-commit-oxc.sh](.claude/scripts/pre-commit-oxc.sh) together.
- **Session-end review**: [stop-review-agents.sh](.claude/scripts/stop-review-agents.sh) (Stop hook) prompts capturing session learnings in this file (shared conventions) and auto-memory (user preferences + project context) when the tree has changes.

## GitHub Actions Integration

- GitHub Environments must be created manually (the action lacks permission to create them).
- `GITHUB_TOKEN` permissions: `actions:read`, `contents:read`, `deployments:write`, `pull-requests:write`.
- Supported events only: `push`, `pull_request`, `workflow_dispatch`, `workflow_run` (validated in [src/deploy/main.ts](src/deploy/main.ts)).
- The deployment payload embeds Cloudflare metadata so the delete workflow can find deployments ([types.ts](src/common/github/deployment/types.ts)).
- **`workflow_run` + fork PRs**: `github.event.workflow_run.pull_requests` is **empty for fork PRs** ([community #25220](https://github.com/orgs/community/discussions/25220)). Never derive `pr-number` or `branch` from `pull_requests[0].number` in docs/examples — it silently resolves to empty for the exact fork case those examples target. Save the number in the triggering `pull_request` workflow and read it from an artifact (`upload-artifact` → `download-artifact` with `run-id: ${{ github.event.workflow_run.id }}` + `github-token`). See the "Custom branch name" example in [README.md](README.md).

## Effect

This repo uses the Effect TypeScript library. Before writing any Effect code, read `node_modules/effect/AGENTS.md` **completely** and follow its links.

The Effect source is vendored as a git subtree at [repos/effect/](repos/effect/) — treat it as the source of truth for idiomatic usage, tests, module structure and API design, and prefer it over web search or recall. Useful entry points: [repos/effect/packages/](repos/effect/packages/) (source + tests), [repos/effect/.agents/AGENTS.md](repos/effect/.agents/AGENTS.md), [repos/effect/LLMS.md](repos/effect/LLMS.md), [repos/effect/MIGRATION.md](repos/effect/MIGRATION.md).

Rules for `repos/` (all vendored repos): read-only reference — do not edit unless explicitly asked, and never import from it (application code imports from normal package dependencies). **Every tool must ignore it** — a fresh subtree otherwise adds ~900 vendored test files to vitest (which then fails to collect) and ~1,500 files to `tsc`. Exclusions live in [.oxfmtrc.json](.oxfmtrc.json), [.oxlintrc.json](.oxlintrc.json), [knip.json](knip.json), [tsconfig.json](tsconfig.json) `exclude`, [vitest.config.ts](vitest.config.ts) `test.exclude`, [prek.toml](prek.toml) `exclude`, [.gitattributes](.gitattributes) (`linguist-vendored`, no diff) and [.vscode/settings.json](.vscode/settings.json) (search / files / watcher / auto-import). Add a new vendored repo → add it to all of them. `lint` also runs `oxlint --disable-nested-config` ([package.json](package.json), [pre-commit-oxc.sh](.claude/scripts/pre-commit-oxc.sh)) because oxlint discovers nested `.oxlintrc.json` files regardless of `ignorePatterns`, and `repos/effect/.oxlintrc.json` references a plugin that is not installed here — without the flag `pnpm run lint` fails outright. GraphQL codegen needs no entry (its `documents` globs are scoped to `src/` and `bin/`).

**Keeping the subtree current**: it tracks Effect `main` and must stay in step with `dependencies.effect` in [package.json](package.json) — after bumping that dependency, re-pull from the repo root with a clean tree:

```sh
git subtree pull --prefix=repos/effect https://github.com/Effect-TS/effect.git main --squash
```

`--squash` keeps upstream history out of this repo. Compare `repos/effect/packages/effect/package.json` `version` against `dependencies.effect` to see drift (the subtree can run ahead of the released version). Never hand-edit files under `repos/effect/` to "fix" drift — re-pull instead. User-facing copy of this lives in the Development section of [README.md](README.md); keep the two in sync.

## Resources

- [README.md](README.md) — user-facing docs for the deploy action.
- [delete/README.md](delete/README.md) — user-facing docs for the delete action.
- [CHANGELOG.md](CHANGELOG.md) — changes and breaking changes.
