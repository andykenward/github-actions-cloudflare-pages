# GitHub Actions Cloudflare Pages — AI Agent Instructions

Dual-mode GitHub Action for Cloudflare Pages. **deploy** creates deployments via the Wrangler CLI and links them to GitHub Deployments/Environments; **delete** batch-removes old deployments. TypeScript ESM, Effect, GraphQL-typed GitHub API, vitest.

## Critical Rules

Non-negotiable. Violating these breaks the build or the type system.

1. **GitHub API → GraphQL only, never REST.** Use the typed `request()` in [src/common/github/api/client.ts](src/common/github/api/client.ts). The single legacy exception is listing deployments ([deployment/get.ts](src/common/github/deployment/get.ts) via Octokit REST `paginate`) — don't add more.
2. **After editing any GraphQL operation → `pnpm run codegen`** before type-checking or building — generated types do not exist until you do.
3. **Imports → `@/` path aliases.** Keep [tsconfig.json](tsconfig.json) `paths` in sync with [vitest.config.ts](vitest.config.ts) `resolve.alias`, or `vi.mock()` silently fails. Imports carry a `.js` extension (`@/common/utils.js`, `./main.js`) except `@/input-keys`; JSON uses `with {type: 'json'}`.
4. **Never hand-edit generated dirs** — [`__generated__/gql/`](__generated__/gql/) (codegen), [`__generated__/types/`](__generated__/types/) (`codegen:events` / `codegen:cloudflare`), [`__generated__/payloads/`](__generated__/payloads/) (`pnpm run download`). Exception: [`__generated__/responses/`](__generated__/responses/) holds **hand-maintained** API response fixtures — add to it freely.
5. **No `console.log`** — use `@actions/core` (`info`, `debug`, `warning`, `error`, `setFailed`).
6. **Touch an exported function → update its tests.** Tests for `bin/` scripts live in `__tests__/scripts/` (NOT `__tests__/bin/`, which vitest excludes).
7. **Change a GraphQL selection set → update every test mock** for that operation (`grep` the operation name across `__tests__/`; multiple files may mock it).
8. **Run scripts with the right runner** — `node` normally, `tsx` for anything that transitively imports `__generated__/gql/`; see [Build & Tooling](#build--tooling).
9. **`dist/` is committed and is what runs.** [action.yml](action.yml) executes `dist/deploy/index.js`; CI ([check-dist.yml](.github/workflows/check-dist.yml)) rebuilds and fails on any diff. After changing anything bundled, `pnpm run build` and commit `dist/` with it.

## Architecture

| Path                                             | Role                                                                                                                        |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| [src/deploy/index.ts](src/deploy/index.ts)       | Deploy entry → bundled to [dist/deploy/index.js](dist/deploy/index.js) → consumed by [action.yml](action.yml)               |
| [src/delete/index.ts](src/delete/index.ts)       | Delete entry → bundled to [dist/delete/index.js](dist/delete/index.js) → consumed by [delete/action.yml](delete/action.yml) |
| [src/common/](src/common/)                       | Shared logic (GitHub API, Cloudflare deploy, batch ops)                                                                     |
| [src/common/github/](src/common/github/)         | GitHub API: deployments, comments, environments                                                                             |
| [src/common/cloudflare/](src/common/cloudflare/) | Cloudflare Pages API + deployment logic                                                                                     |
| [`__generated__/`](__generated__/)               | Generated gql/types/payloads — never edit; `responses/` fixtures are hand-maintained (Critical Rule 4)                      |
| [`__fixtures__/`](__fixtures__/)                 | Manually maintained test data                                                                                               |
| [`__tests__/`](__tests__/)                       | Mirrors `src/` with `.test.ts` suffix                                                                                       |
| [input-keys.ts](input-keys.ts)                   | Action input names (shared by `src/` and tests)                                                                             |
| [bin/](bin/)                                     | Dev scripts: codegen, payload download, version sync                                                                        |
| [example/](example/)                             | Prebuilt static site + Pages Function the repo's own workflows deploy (dogfooding)                                          |
| [schema/github/](schema/github/)                 | GitHub GraphQL SDL (refreshed weekly by [update.yml](.github/workflows/update.yml))                                         |

### Runtime flow

**Deploy** ([src/deploy/main.ts](src/deploy/main.ts)): read inputs → load event from `GITHUB_EVENT_PATH` (name validated against generated `EVENT_NAMES`, then the supported set) → `npx wrangler@<v> pages deploy <directory> --project-name … --branch … --commit-dirty=true --commit-hash <sha>` in `working-directory` → poll the deployments list for the one matching the commit hash (1s interval, 10 min ceiling) until stage `deploy` is `success`/`active` or any stage `failure`/`canceled` → set outputs `id`/`url`/`environment`/`alias`/`wrangler` + job summary → **concurrently** post the PR comment and check the GitHub Environment exists → create GitHub Deployment (JSON payload `{cloudflare: {id, accountId, projectName}, url, commentId}`) + `SUCCESS` status with the dashboard log URL.

- **PR resolution for the comment** ([comment.ts](src/common/github/comment.ts)): `pr-number` input wins; else `pull_request` → payload node id (skipped on `closed`); `workflow_dispatch` → first open PR whose head is the branch; `workflow_run` → the single `pull_requests[]` entry matching `head_branch` + `head_sha`; `push` → no comment.
- **Branch/sha** ([context.ts](src/common/github/context.ts)): `workflow_run` takes `workflow_run.head_branch`/`head_sha` from the payload; other events use `GITHUB_HEAD_REF || GITHUB_REF_NAME` and `GITHUB_SHA`. The `branch` input overrides only the Cloudflare `--branch`.

**Delete** ([src/delete/main.ts](src/delete/main.ts)): list GitHub deployments for the context branch (+ optional `github-environment`), newest first → drop the first `keep-latest` → [batchDelete](src/common/batch-delete.ts) each (concurrency 5): decode payload → Cloudflare `DELETE …?force=true` (error code `8000009` "not found" counts as success) → GitHub status `INACTIVE` → delete the GitHub deployment and its PR comment → job summary table. Per-deployment failures come back as `success: false` rows rather than throwing.

- **Payload versions** ([payload.ts](src/common/github/deployment/payload.ts)): V2 embeds the Cloudflare account/project; legacy V1 (`cloudflareId`) falls back to the `cloudflare-account-id`/`cloudflare-project-name` inputs. Keep V1 decoding — old deployments still exist in users' repos.

**GraphQL type safety**: inline ``graphql(/* GraphQL */ `...`)`` operations in `src/**` and `bin/**` are typed via [@graphql-codegen/client-preset](graphql.config.ts). The custom client [src/common/github/api/client.ts](src/common/github/api/client.ts) wraps fetch with `TypedDocumentString` for compile-time validation. Preview features come from [schema/github/schema.graphql](schema/github/schema.graphql).

**GitHub client**: `request()` throws on non-2xx and, by default, on a GraphQL `errors` array — pass `options: {errorThrows: false}` to inspect `errors` yourself (as `batchDelete` and `checkEnvironment` do).

**Cloudflare**: `wrangler pages deploy` runs via `execFileAsync('npx', [...])` ([create.ts](src/common/cloudflare/deployment/create.ts#L69-L88)); the API token and account id go into the **child process env only** — never assign them onto `process.env`. Wrangler is external to the bundle ([esbuild.config.js](esbuild.config.js)) and installed at runtime via `npx wrangler@<version>` — from the `wrangler-version` input or the default in [src/common/inputs.ts](src/common/inputs.ts), which [bin/sync-versions.ts](bin/sync-versions.ts) keeps in lockstep with `devDependencies.wrangler` (single source of truth; tests read it too). Status polling and deletion use the typed [openapi-fetch](https://openapi-ts.dev/openapi-fetch/) client [api/client.ts](src/common/cloudflare/api/client.ts); the `{success, result, errors}` envelope is unwrapped by `unwrap`/`unwrapSuccess` in [fetch-result.ts](src/common/cloudflare/api/fetch-result.ts), which owns envelope error handling. [endpoints.ts](src/common/cloudflare/api/endpoints.ts) only builds the `dash.cloudflare.com` log URL.

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
| `pnpm run test` / `test:watch` | Vitest run / interactive (`test:ci` adds the GitHub Actions reporter)                                                                  |
| `pnpm run lint` / `lint:fix`   | oxlint (type-aware, includes Effect diagnostics)                                                                                       |
| `pnpm run format`              | oxfmt write (`format:check` to verify)                                                                                                 |
| `pnpm run download`            | Refresh [`__generated__/payloads/`](__generated__/payloads/) from `octokit/webhooks` (needs `GITHUB_TOKEN` in `.env`)                  |
| `pnpm run sync:readme`         | Rewrite pinned `@<sha> #vX.Y.Z` action refs in READMEs and workflow templates                                                          |
| `pnpm run start`               | Run the built deploy action locally with `.env` loaded (see [.env.example](.env.example))                                              |
| `pnpm run deployments:delete`  | Delete **all preview** deployments of the `.env` Cloudflare project (bypasses GitHub; stops when a pass deletes nothing)               |
| `pnpm run act:d`               | Test the delete action locally with `act`                                                                                              |
| `pnpm changeset`               | Record a changeset for notable/breaking changes                                                                                        |

## Task Playbooks

**Add a GitHub API operation**: write the ``graphql(/* GraphQL */ `...`)`` operation (pattern: [comment.ts](src/common/github/comment.ts); [bin/download/](bin/download/) predates codegen and uses a raw string — don't copy it) → `pnpm run codegen` → import types from [`__generated__/gql/graphql.ts`](__generated__/gql/graphql.ts) and call via the typed `request()` client. A scalar generated as `any` needs a mapping in [graphql.config.ts](graphql.config.ts) plus a re-run.

**Change a GraphQL selection set**: edit → `pnpm run codegen` → update **every** test mock for that operation (`grep` the operation name across `__tests__/`).

**Add an action input**

1. Add it to [action.yml](action.yml) or [delete/action.yml](delete/action.yml).
2. Add `INPUT_KEY_*` in [input-keys.ts](input-keys.ts). `INPUT_KEYS_REQUIRED` is consumed **only** by the test helper `stubRequiredInputEnv()` — it means "stubbed in every test", not "required in action.yml" (e.g. `keep-latest` is listed, stubbed as `'0'` via `TYPED_INPUT_VALUES`).
3. Add it to the `Config.all({...})` in the right module — [src/common/inputs.ts](src/common/inputs.ts) (used by both actions: tokens, environment, `pr-number`, `wrangler-version`), [src/deploy/inputs.ts](src/deploy/inputs.ts) or [src/delete/inputs.ts](src/delete/inputs.ts). Strings: `Config.schema(Schema.Trim, KEY)`; secrets: `Config.redacted(KEY)`; optional: `.pipe(Config.withDefault(undefined))` (empty string is treated as missing). Don't call `getInput` directly — see [Effect patterns](#effect-patterns-in-this-repo).
4. Tests: `stubRequiredInputEnv()` covers `INPUT_KEYS_REQUIRED` automatically. Any other input — stub it per-test with `stubInputEnv(INPUT_KEY_X, value)` and assert the default. Input modules memoise, so input tests `vi.resetModules()` and dynamically `import()` the module per test (see [`__tests__/deploy/inputs.test.ts`](__tests__/deploy/inputs.test.ts)).
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

**Error handling**: `raise()` for inline errors with type narrowing — `const {name} = (await checkEnvironment()) ?? raise('Environment required')`. See [src/common/utils.ts](src/common/utils.ts). **Only the entry points call `setFailed`** (via `reportFailure`) — helpers throw; calling `setFailed` before throwing produces a duplicate error annotation. Log another tool's output (e.g. wrangler stdout) with `logVerbatim()`, not `info()` — `info` writes raw, so a `::` line in it would run as a workflow command. Log with a module-level `PREFIX`/`ERROR_KEY` string (e.g. `delete -`, `GitHub Environment:`) so annotations are attributable.

**Testing**

- [vitest.setup.ts](vitest.setup.ts) stubs required env + input env vars before each test; [`__mocks__/@actions/core.ts`](__mocks__/@actions/core.ts) provides `vi.fn()` wrappers for all `@actions/core` methods.
- HTTP: undici `MockAgent` ([`__tests__/helpers/api.ts`](__tests__/helpers/api.ts)); assert `mockApi.mockAgent.assertNoPendingInterceptors()` to catch missed calls.
- **Never bump `undici` across a major.** It is pinned to Node's bundled major on purpose ([.github/dependabot.yml](.github/dependabot.yml) ignores its majors). `setGlobalDispatcher()` and Node's built-in `fetch` find each other through a versioned global symbol (`Symbol.for('undici.globalDispatcher.N')`); undici 8 bumped it to `.2` while Node 24 reads `.1`, so `MockAgent` **silently stops intercepting** and tests hit the real network — failing with genuine API responses, not connection errors. Check `process.versions.undici`; only raise the major once Node's bundled major moves.
- Helpers: `stubTestEnvVars()` ([env.ts](__tests__/helpers/env.ts)), `stubRequiredInputEnv()` ([inputs.ts](__tests__/helpers/inputs.ts)). Fixtures: [`__generated__/payloads/`](__generated__/payloads/), [`__generated__/responses/`](__generated__/responses/).
- `vi.mock(import('@/...'))` — always path aliases, to match vitest aliases. `vi.mock(import('@actions/core'))` auto-loads the `__mocks__` file.
- **Manual module mocks** sit beside their source in `src/**/__mocks__/` ([utils.ts](src/common/__mocks__/utils.ts) — `execFileAsync`/`sleep` as `vi.fn()`, [comment.ts](src/common/github/__mocks__/comment.ts), [environment.ts](src/common/github/__mocks__/environment.ts), [deployment/create.ts](src/common/github/deployment/__mocks__/create.ts)); a bare `vi.mock(import('@/common/utils.js'))` picks them up. Update the mock when you change the real export's signature.
- Wrangler is never executed in tests — mock `execFileAsync`. Pass `statusOptions` (e.g. zero `pollInterval`) to `createCloudflareDeployment`/`statusCloudflareDeployment` to poll without delay.
- `stubTestEnvVars(eventName)` loads a matching payload from [`__generated__/payloads/`](__generated__/payloads/) for `pull_request` (default), `workflow_dispatch` and `workflow_run`; any other event throws — add a case in [env.ts](__tests__/helpers/env.ts).
- `__tests__/helpers/` is excluded from test collection; snapshot files live in `__snapshots__/` beside the test (`vitest run -u` to update deliberately).
- Use `describe(functionName)` with the actual function reference for IDE navigation.

**Docs**

- **Keep user-facing docs in sync**: [README.md](README.md) documents the deploy action; [delete/README.md](delete/README.md) the delete action. Adding, changing or removing an input/output — or any user-visible behavior — means updating the matching Inputs/Outputs table and examples. The pinned `andykenward/...@<sha> #vX.Y.Z` refs are maintained by [bin/sync-readme-versions.ts](bin/sync-readme-versions.ts); don't hand-edit the SHA or version.
- **Markdown paths**: wrap `__dunder__` path tokens in backticks — e.g. ``[`__generated__/`](__generated__/)`` — or the formatter reads `__x__` as bold emphasis and mangles link text and target.

## Build & Tooling

- **Versions**: Node via `engines`, pnpm via `packageManager` — both in [package.json](package.json).
- **Dependencies**: [.npmrc](.npmrc) `save-exact=true` — pin exact versions. [pnpm-workspace.yaml](pnpm-workspace.yaml) sets `minimumReleaseAge: 10080`, so pnpm **refuses versions published less than 7 days ago** (a failing `pnpm add` of a fresh release is expected, not a registry problem); `allowBuilds` disables install scripts for esbuild/workerd/sharp/msgpackr-extract.
- **TypeScript 6 + 7 side by side**: TS 7 (Go-native) ships **no programmatic API** until 7.1, so [package.json](package.json) installs both under npm aliases — `"@typescript/native": "npm:typescript@7"` supplies the `tsc` binary used by `tsc:check` / `tsc:ls` / CI, and `"typescript": "npm:@typescript/typescript6@6"` keeps the 6.0 API on the `typescript` specifier for tools that `import ts from 'typescript'` (`openapi-typescript`, and `cosmiconfig` via `graphql-config` loading [graphql.config.ts](graphql.config.ts)), plus a `tsc6` binary. Bump them independently; never collapse to one dependency until 7.1 ships the API. `knip` (oxc-parser) and `oxlint-tsgolint` need neither.
- **`@effect/tsgo`**: the Effect language service is delivered by patching binaries in place, not a separate LSP. `prepare` runs `effect-tsgo patch --typescript --oxlint` on every install, patching the platform `tsc` under `@typescript/native` and the `oxlint` / `oxlint-tsgolint` binaries (`effect-tsgo unpatch` reverses it). **Effect diagnostics come from `pnpm run lint`, not `tsc:check`** — the `@effect/language-service` plugin in [tsconfig.json](tsconfig.json) sets `"diagnostics": false` so the passes don't double-report ([docs](https://effect.website/docs/v4/getting-started/devtools#oxlint)). [.oxlintrc.json](.oxlintrc.json) extends only the `correctness` + `antipattern` presets from `node_modules/@effect/tsgo/oxlint-presets/` and adds `effecttsgo` to `plugins`; `effect-native`, `style` and `recommended` are deliberately excluded (~140 warnings on every `async` function, `process.env` read and `node:*` import). Preset rules are `warn` and `lint` has no `--max-warnings`, so they don't fail CI. The plugin name is not an installed package (it lives inside `@effect/tsgo`) — hence the `ignoreDependencies` entry in [knip.json](knip.json). The oxlint patch is version-coupled: bump `@effect/tsgo`, `oxlint` and `oxlint-tsgolint` together and re-run `pnpm install`. Standalone: `pnpm exec effect-tsgo diagnostics --project tsconfig.json`.
- **`node` vs `tsx`**: prefer `node path/to/script.ts` (native type-stripping, no extra dep) — fine when a script's **runtime** imports are only `node:*`, relative paths, `package.json`, npm packages, or **type-only** `@/` aliases (`import type` is stripped, so the alias never resolves at runtime — e.g. `node bin/deployments/index.ts`). Use `tsx` for any script that transitively imports `__generated__/gql/` (e.g. `tsx bin/sync-readme-versions.ts`): `graphql.ts` emits `export enum`, which `--experimental-strip-types` rejects, and `gql.ts` has a runtime `import * as types from './graphql.js'` that node won't remap `.js`→`.ts`. Neither is hand-fixable (generated files). `tsx` reads tsconfig paths, transforms enums and remaps extensions. `verbatimModuleSyntax` doesn't change this; `#`-prefixed subpath imports only redirect the entry import.
- **Bin script pattern**: a `bin/` script that is both importable (tests) and executable wraps side effects in `if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)` and exports pure functions. Reference: [bin/sync-readme-versions.ts](bin/sync-readme-versions.ts).
- **ESBuild** ([esbuild.config.js](esbuild.config.js)): banner adds a `createRequire` shim ([L47-L63](esbuild.config.js#L47-L63)); `wrangler` external; the `sideEffectFree` plugin marks `undici`/`tunnel` side-effect-free so the unused OIDC proxy path pulled in by `@actions/core` → `@actions/http-client` is tree-shaken (~570 KB, 70% of each bundle; CommonJS deps without a `sideEffects` field are otherwise kept whole — check `metafile` output before blaming the bundler); minification is syntax + whitespace only (`keepNames`, identifiers preserved); sourcemaps on.
- **Formatting** (oxfmt, [.oxfmtrc.json](.oxfmtrc.json)): no semicolons, single quotes, no bracket spacing, no trailing commas, `arrowParens: avoid`, sorted imports (type imports → `node:` → external → internal → relative). Let the formatter do it rather than hand-matching.
- **Sequencing**: `pnpm run codegen` after GraphQL changes before building; update [input-keys.ts](input-keys.ts) after changing input keys in [action.yml](action.yml).
- **Debugging**: `pnpm run start` runs the built deploy action with a `.env` modelled on [.env.example](.env.example) (inputs as `INPUT_*` vars); set `ACTIONS_STEP_DEBUG=true` for `debug()` output; add `debugger` statements and run vitest under the Node inspector.
- **Code quality**: knip ([knip.json](knip.json)), oxlint ([.oxlintrc.json](.oxlintrc.json)), TypeScript strict (`verbatimModuleSyntax`, `noEmit`, `checkJs`).
- **Line anchors**: some links here use line numbers (`create.ts#L69-L88`, `esbuild.config.js#L47-L63`) — update them when editing that code.

## Dev Environment Hooks

Formatting and linting are automated via [prek](https://prek.j178.dev) (`prek.toml`) and Claude Code hooks ([.claude/settings.json](.claude/settings.json), scripts in [.claude/scripts/](.claude/scripts/)).

- **CI**: [prek.yml](.github/workflows/prek.yml) runs `prek run --all-files` on PRs and `main` (it replaced pre-commit.ci, which can't read `prek.toml`). Pin its `prek-version` to the prek in [.devcontainer/Dockerfile](.devcontainer/Dockerfile).
- **Hook Sync Rule**: change formatter/linter behavior or script paths → update the `oxc-format-and-lint` hook in [prek.toml](prek.toml) and the usage header in [.claude/scripts/pre-commit-oxc.sh](.claude/scripts/pre-commit-oxc.sh) together.
- **Session-end review**: [stop-review-agents.sh](.claude/scripts/stop-review-agents.sh) (Stop hook) prompts capturing session learnings in this file (shared conventions) and auto-memory (user preferences + project context) when the tree has changes.

## CI & Release

- [test.yml](.github/workflows/test.yml) runs only `lint`, `tsc:check`, `test:ci` — **not** knip, format or codegen drift. Run `pnpm run all` locally before a PR.
- [check-dist.yml](.github/workflows/check-dist.yml) fails if the committed `dist/` differs from a fresh build (Critical Rule 9).
- [deploy.yml](.github/workflows/deploy.yml) / [deploy-main.yml](.github/workflows/deploy-main.yml) / [deploy-delete.yml](.github/workflows/deploy-delete.yml) dogfood the action (`uses: ./`, `./delete`) against [example/](example/); fork PRs are skipped.
- **Release** ([release.yml](.github/workflows/release.yml)): after `test` passes on `main`, changesets/action opens the "Version Packages" PR, and on merge runs `pnpm release` (`pnpm run all && changeset publish`) — the package is private, so "publish" means a git tag + GitHub release. A `v*` tag triggers [sync-readme-versions.yml](.github/workflows/sync-readme-versions.yml), which PRs the new pinned SHA into the READMEs and [workflow templates](.github/workflow-templates/).
- [update.yml](.github/workflows/update.yml) (weekly) opens PRs refreshing webhook payloads, generated types and the GitHub GraphQL schema.
- **Workflow hygiene** (enforced by [zizmor](.github/workflows/zizmor.yml)): pin every action to a full SHA with a `#vX.Y.Z` comment, `permissions: {}` at workflow level with per-job grants, `persist-credentials: false` on checkout.

## GitHub Actions Integration

- GitHub Environments must be created manually (the action lacks permission to create them).
- `GITHUB_TOKEN` permissions: `actions:read`, `contents:read`, `deployments:write`, `pull-requests:write`.
- Supported events only: `push`, `pull_request`, `workflow_dispatch`, `workflow_run` (validated in [src/deploy/main.ts](src/deploy/main.ts)).
- The deployment payload embeds Cloudflare metadata so the delete workflow can find deployments ([types.ts](src/common/github/deployment/types.ts)).
- **`workflow_run` + fork PRs**: `github.event.workflow_run.pull_requests` is **empty for fork PRs** ([community #25220](https://github.com/orgs/community/discussions/25220)). Never derive `pr-number` or `branch` from `pull_requests[0].number` in docs/examples — it silently resolves to empty for the exact fork case those examples target. Save the number in the triggering `pull_request` workflow and read it from an artifact (`upload-artifact` → `download-artifact` with `run-id: ${{ github.event.workflow_run.id }}` + `github-token`). See the "Custom branch name" example in [README.md](README.md).

## Effect

This repo uses the Effect TypeScript library (v4 — `effect/Schema`, `effect/Config`, `effect/Result`; not v3 APIs). Before writing any Effect code, read `node_modules/effect/AGENTS.md` **completely** and follow its links.

### Effect patterns in this repo

Adoption is incremental: entry points and inputs are Effect, most of `src/common/` is still plain `async`/Promise. Keep that boundary deliberate.

- **Entry points** ([src/deploy/index.ts](src/deploy/index.ts)): `Effect.runPromiseExit(run)` then `reportFailure(exit.cause)` ([errors.ts](src/common/errors.ts)) unless interrupt-only — `setFailed` gets a one-line `errorMessage()`; the full `Cause.pretty` (stacks, nested causes) goes to `debug()` so it only shows with step debug logging. Build `*Error.from` messages with `errorMessage()` too: `ConfigError` is not an `Error`, and it maps it to `Input required and not supplied: <key>` / `Input '<key>' is invalid: …`. Never `void run()`/`runFork` (a failed deploy exits 0) or `NodeRuntime.runMain` (its `process.exit` can truncate buffered workflow commands on stdout).
- **`run`** is exported as an `Effect` value, not a zero-arg function (`effecttsgo/lazy-effect`); it wraps each Promise helper in `Effect.try`/`Effect.tryPromise` with `catch: XError.from`.
- **Errors**: `Schema.TaggedError` classes with `message` + `cause: Schema.Defect()` and a static `from(cause)` (`DeployError`, `DeleteError`); each needs `// oxlint-disable-next-line unicorn/throw-new-error`.
- **Inputs**: `Config.all({...}).parse(actionInputProvider)`. [provider.ts](src/common/config/provider.ts) uses `ConfigProvider.fromEnvRecord(process.env)` because the default provider snapshots `process.env` once and never sees `vi.stubEnv`; it mirrors `getInput` naming (`INPUT_` + upper-case, spaces→`_`, **hyphens kept**: `INPUT_KEEP-LATEST`), so `ConfigProvider.constantCase` would break it. `useInputs()` stays **synchronous** (openapi-fetch middleware can't await) and memoises **success only** — don't swap in `Effect.cached`, which would replay a first failure forever.
- **Secrets**: `Config.redacted`; unwrap with `secret()` from [src/common/inputs.ts](src/common/inputs.ts) only at the point of use (auth header, child env). `useCommonInputs()` also registers both tokens with `setSecret` on first read — the runner only auto-masks `secrets.*` values, not tokens passed from step outputs or env vars.
- **Non-throwing decode**: `Option.getOrUndefined(Result.getSuccess(Schema.decodeUnknownResult(S)(x)))` ([payload.ts](src/common/github/deployment/payload.ts), [workflow-event.ts](src/common/github/workflow-event/workflow-event.ts)).
- **Effect inside a Promise API**: [status.ts](src/common/cloudflare/deployment/status.ts) polls with `Effect.retry` (`Schedule.spaced` + `Schedule.upTo`) plus an outer `Effect.timeout` (the real ceiling), runs itself, and rethrows the **original** cause so callers still see e.g. `ParseError`.
- Lint suppressions you'll need: `unicorn/no-useless-undefined` on `Config.withDefault(undefined)`, `unicorn/no-array-for-each` on `Effect.forEach`.

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
