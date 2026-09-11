---
paths:
  - 'package.json'
  - 'pnpm-workspace.yaml'
  - '.npmrc'
  - 'tsconfig.json'
  - '.oxlintrc.json'
  - '.oxfmtrc.json'
  - 'knip.json'
  - 'esbuild.config.js'
  - 'prek.toml'
  - 'bin/**'
  - '.claude/scripts/**'
  - '.claude/marketplace/**'
  - '.claude/settings.json'
  - '.devcontainer/**'
  - '.vscode/**'
---

# Build and tooling

## Dependencies

- Node comes from `engines`, pnpm from `packageManager` (`package.json`). `.npmrc` sets `save-exact=true` — pin exact versions.
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 10080`, so pnpm **refuses versions published less than 7 days ago** — a failing `pnpm add` of a fresh release is expected, not a registry fault. `allowBuilds` disables install scripts for esbuild, workerd, sharp and msgpackr-extract.
- **Never bump `undici` across a major.** `setGlobalDispatcher()` reaches Node's built-in `fetch` only through a versioned global symbol (`Symbol.for('undici.globalDispatcher.1')` on Node 24). A different undici major can register under a different symbol — undici 8 did — and then `MockAgent` silently stops intercepting and tests hit the real network. Check `process.versions.undici` and raise the major only when Node's bundled one does (Dependabot ignores its majors).
- Bump coupled packages together: `effect` + `@effect/vitest` (it peers on `^<effect version>`); `@effect/tsgo` + `oxlint` + `oxlint-tsgolint` (the patch is version-coupled — re-run `pnpm install` after). Dependabot's `effect` and `ox` groups do this.
- **TypeScript 6 + 7 side by side.** TS 7 (Go-native) has no programmatic API until 7.1, so `"@typescript/native": "npm:typescript@7"` supplies the `tsc` binary (`tsc:check`, `tsc:ls`, CI) and `"typescript": "npm:@typescript/typescript6@6"` keeps the 6.0 API for tools that `import ts from 'typescript'` (`openapi-typescript`; `cosmiconfig` via `graphql-config`), plus a `tsc6` binary. Bump them independently; don't collapse them into one dependency until 7.1. `knip` (oxc-parser) and `oxlint-tsgolint` need neither.

## Effect language service (`@effect/tsgo`)

- It patches binaries in place: `prepare` runs `effect-tsgo patch --typescript --oxlint` on every install, patching the platform `tsc` under `@typescript/native` and the `oxlint` / `oxlint-tsgolint` binaries. `effect-tsgo unpatch` reverses it.
- Effect diagnostics come from `pnpm run lint`, not `tsc:check` — `tsconfig.json` sets the `@effect/language-service` plugin's `"diagnostics": false` so they aren't reported twice ([docs](https://effect.website/docs/v4/getting-started/devtools#oxlint)).
- `.oxlintrc.json` adds `effecttsgo` to `plugins` and extends only the `correctness` + `antipattern` presets from `node_modules/@effect/tsgo/oxlint-presets/`; `effect-native`, `style` and `recommended` are excluded on purpose (~140 warnings on every `async` function, `process.env` read and `node:*` import). Preset rules are `warn` and `lint` has no `--max-warnings`, so they don't fail CI.
- The `tsconfig.json` plugin name `@effect/language-service` isn't an installed package (`@effect/tsgo` provides it) — hence its `ignoreDependencies` entry in `knip.json`.
- Standalone check: `pnpm exec effect-tsgo diagnostics --project tsconfig.json`.

## Scripts

- Prefer `node path/to/script.ts` (native type-stripping, no extra dependency). It works when the script's **runtime** imports are only `node:*`, relative paths, `package.json`, npm packages or **type-only** `@/` aliases (`import type` is erased) — e.g. `node bin/deployments/index.ts`.
- Use `tsx` for anything that transitively imports `__generated__/gql/` (e.g. `tsx bin/sync-readme-versions.ts`): `graphql.ts` emits `export enum`, which type-stripping rejects, and `gql.ts` has a runtime `import * as types from './graphql.js'` that node won't remap to `.ts`. Neither is fixable — they're generated. `tsx` reads tsconfig paths, transforms enums and remaps extensions; `verbatimModuleSyntax` doesn't change any of this, and `#`-prefixed subpath imports only redirect the entry import.
- A `bin/` script that is both importable (for tests) and executable wraps side effects in `if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)` and exports pure functions (reference: `bin/sync-readme-versions.ts`). Its tests go in `__tests__/scripts/`. To call its exports ad hoc, import them from an `.mts` file run with `tsx` — `tsx -e` evaluates as CommonJS and fails on the script's top-level `await`.

## Bundling (`esbuild.config.js`)

- A banner adds a `createRequire` shim; `wrangler` is external; minification is syntax + whitespace only (`keepNames`); sourcemaps are on.
- The `sideEffectFree` plugin marks `undici` / `tunnel` side-effect-free so the unused OIDC proxy path pulled in by `@actions/core` → `@actions/http-client` is tree-shaken (~570 KB, 70% of each bundle). CommonJS deps without a `sideEffects` field are otherwise kept whole — enable esbuild's `metafile` and inspect it before blaming the bundler.

## Hooks and editor

- prek (`prek.toml`) formats and lints on commit. In CI, `.github/workflows/prek.yml` runs `prek run --all-files` on PRs and `main` (it replaced pre-commit.ci, which can't read `prek.toml`); keep its `prek-version` equal to the prek in `.devcontainer/Dockerfile`.
- Changing formatter/linter behavior or script paths → update the `oxc-format-and-lint` hook in `prek.toml` and the usage header of `.claude/scripts/pre-commit-oxc.sh` together.
- The Stop hook `.claude/scripts/stop-review-agents.sh` asks the agent to record session learnings when tracked files have uncommitted changes (untracked files alone don't trigger it).
- Claude Code LSP: the project plugin `typescript-7-lsp` (`.claude/marketplace/typescript-7-lsp/.lsp.json`) runs the patched `node_modules/.bin/tsc --lsp --stdio`, so it needs `pnpm install` first. `.claude/settings.json` registers its `cloudflare-pages-action` directory marketplace and enables it; Claude Code asks you to trust the marketplace on first run. Don't also enable the official `typescript-lsp` plugin — both claim `.ts`. Validate manifests with `claude plugin validate .claude/marketplace`.
- `repos/` must stay excluded in `.oxfmtrc.json`, `.oxlintrc.json`, `knip.json`, `tsconfig.json`, `prek.toml` and `.vscode/settings.json`, and `package.json` `lint` must keep `--disable-nested-config` — see the repos rule.

## Debugging

- `pnpm run start` runs the built deploy action with a `.env` modelled on `.env.example` (inputs as `INPUT_*` vars).
- Set `ACTIONS_STEP_DEBUG=true` to see `debug()` output.
- Add `debugger` statements and run vitest under the Node inspector.
