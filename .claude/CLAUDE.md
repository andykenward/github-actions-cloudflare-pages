# GitHub Actions Cloudflare Pages — AI Agent Instructions

Dual-mode GitHub Action for Cloudflare Pages: **deploy** runs `wrangler pages deploy` and records a GitHub Deployment/Environment; **delete** batch-removes old deployments. TypeScript ESM (strict, `verbatimModuleSyntax`, `checkJs`), Effect v4, GraphQL-typed GitHub API, vitest, pnpm.

## Critical rules

1. **GitHub API → GraphQL only**, via `GitHubApi.request` (`src/common/github/api/client.ts`). The one REST call is `GitHubRestApi.paginate` in `src/common/github/deployment/get.ts` — don't add more.
2. **GraphQL lives in `.graphql` files.** After editing one, run `pnpm run codegen`, then update every test mock for it (`grep -rn XDocument __tests__/`).
3. **Import with `@/` aliases and a `.js` extension** (`@/common/utils.js`), except `@/input-keys`; import JSON `with {type: 'json'}`. Keep `tsconfig.json` `paths` and `vitest.config.ts` `resolve.alias` identical, or `vi.mock()` silently fails.
4. **Never hand-edit `__generated__/gql/`, `__generated__/types/` or `__generated__/payloads/`** — regenerate them (see Commands). `__generated__/responses/` is hand-maintained fixtures.
5. **No `console.log`** — use `@actions/core` (`info`, `debug`, `warning`, `error`). Only entry points call `setFailed` (via `reportFailure`); a helper that calls it before failing duplicates the error annotation.
6. **Changed an exported function → update its tests.** Tests for `bin/` scripts go in `__tests__/scripts/` (vitest excludes `__tests__/bin/`).
7. **Run scripts with `node`**, or `tsx` when they transitively import `__generated__/gql/` (its enums and `.js` imports break type-stripping).
8. **`dist/` is committed and is what runs.** After changing bundled code, run `pnpm run build` and commit `dist/` — CI fails on any diff.
9. **Every commit must be signed** — rulesets reject unsigned commits on all branches. If signing fails with `communication with agent failed`, ask the user to unlock their SSH agent and retry; never set `commit.gpgsign=false`.
10. **`repos/` is read-only vendored source** — never edit it or import from it.

## Commands

| Command                        | Purpose                                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `pnpm run all`                 | Full validation: sync-versions → knip → codegen → codegen:events → codegen:cloudflare → tsc → format → lint → test → build |
| `pnpm run build`               | Bundle `dist/deploy` and `dist/delete`                                                                                     |
| `pnpm run codegen` (`:watch`)  | GraphQL types → `__generated__/gql/`                                                                                       |
| `pnpm run codegen:cloudflare`  | Cloudflare Pages types → `__generated__/types/cloudflare/`                                                                 |
| `pnpm run codegen:events`      | GitHub event types from `@octokit/openapi-webhooks` → `__generated__/types/github/`                                        |
| `pnpm run download`            | Refresh `__generated__/payloads/` from `octokit/webhooks` (needs `GITHUB_TOKEN` in `.env`)                                 |
| `pnpm run tsc:check`           | Type-check                                                                                                                 |
| `pnpm run test` / `test:watch` | Vitest (`test:ci` adds the GitHub Actions reporter)                                                                        |
| `pnpm run lint` / `lint:fix`   | oxlint, type-aware — also where Effect diagnostics come from                                                               |
| `pnpm run format`              | oxfmt (`format:check` to verify)                                                                                           |
| `pnpm run start`               | Run the built deploy action with `.env` loaded (see `.env.example`)                                                        |
| `pnpm run act:d`               | Run the delete action locally with `act`                                                                                   |
| `pnpm run sync:readme`         | Rewrite pinned `@<sha> #vX.Y.Z` refs in READMEs, workflow templates and the skill                                          |
| `pnpm run deployments:delete`  | Delete **all preview** deployments of the `.env` project, bypassing GitHub; repeats until a pass deletes nothing           |
| `pnpm changeset`               | Record a notable or breaking change for `CHANGELOG.md`                                                                     |

## Before you finish

- Run `pnpm run all` before opening a PR — CI's `test.yml` only runs `lint`, `tsc:check` and `test:ci`, so knip, format and codegen drift go unchecked.
- User-visible change (input, output, behavior) → update `README.md` (deploy) or `delete/README.md` (delete).
- Notable or breaking change → `pnpm changeset`.
- Code style is oxfmt's: no semicolons, single quotes, no bracket spacing, no trailing commas, `arrowParens: avoid`, imports sorted type → `node:` → external → internal → relative. Don't hand-match it — prek formats and lints on commit.

## Layout

- `src/deploy/`, `src/delete/` — entry points (`index.ts` → `main.ts`), bundled to `dist/` and run by `action.yml` / `delete/action.yml`.
- `src/common/` — shared Effect services and logic: `github/`, `cloudflare/`, inputs, batch delete.
- `__tests__/` mirrors `src/` with `.test.ts` files; `__fixtures__/` is hand-maintained test data; `input-keys.ts` names every action input.
- `bin/` — dev scripts (codegen, payload download, version sync). `example/` — the static site + Pages Function this repo's workflows deploy (dogfooding). `schema/github/` — GitHub GraphQL SDL, refreshed weekly.

## Effect

- Effect **v4** (`effect/Schema`, `effect/Config`, `effect/Result`) — never v3 APIs.
- Before writing Effect code, read `node_modules/effect/AGENTS.md` completely and follow its links.
- Treat `repos/effect/` (the vendored Effect source) as the source of truth for idiomatic usage and APIs; prefer it over web search or recall.

## Path-scoped rules

These load automatically when you read a matching file. If one hasn't loaded — e.g. in a subagent, or before you've opened a matching file — read it directly.

| Rule                                         | Loads for                                                                                       | Covers                                                                               |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| [graphql.md](rules/graphql.md)               | `src/**/*.graphql`, `bin/**/*.graphql`, `graphql.config.ts`, `__generated__/gql/`               | Writing operations, codegen, mocks                                                   |
| [effect.md](rules/effect.md)                 | `src/**/*.ts`, `__tests__/**/*.ts`                                                              | Services and layers, entry points, errors, inputs, secrets, polling, summaries, lint |
| [action-runtime.md](rules/action-runtime.md) | `src/**`, `action.yml`, `delete/action.yml`, `input-keys.ts`, `bin/codegen/cloudflare-pages.ts` | Deploy/delete flow, GitHub and Cloudflare clients, adding inputs and Pages endpoints |
| [testing.md](rules/testing.md)               | `__tests__/**`, `**/__mocks__/**`, vitest config                                                | Helpers, Effect tests, mocks, wrangler, snapshots                                    |
| [tooling.md](rules/tooling.md)               | `package.json`, TS/lint/format/bundler config, `bin/**`, `.claude/` config, `.devcontainer/**`  | Dependencies, TypeScript 6 + 7, `@effect/tsgo`, scripts, bundling, hooks, debugging  |
| [workflows.md](rules/workflows.md)           | `.github/**`                                                                                    | CI, release, Dependabot, workflow hygiene, signed bot commits                        |
| [repos.md](rules/repos.md)                   | `repos/**`, the configs that exclude it, `sync-effect.yml`                                      | Vendored-source exclusions and the snapshot sync                                     |
| [docs.md](rules/docs.md)                     | READMEs, `CONTRIBUTING.md`, `action.yml`, workflow templates, `skills/**`, `.claude/**/*.md`    | User and contributor docs, Markdown gotchas, maintaining these instructions          |

Record new learnings where they apply: session-wide rules here, path-specific ones in the matching rule.
