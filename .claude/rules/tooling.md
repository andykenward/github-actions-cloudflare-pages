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
- `pnpm-workspace.yaml` sets `minimumReleaseAge: 10080`, so pnpm **refuses versions published less than 7 days ago** — a failing `pnpm add` of a fresh release is expected, not a registry fault. To take a fresh release on purpose, list the package under `minimumReleaseAgeExclude` there and remove the entry once the release is a week old (`effect`, `@effect/vitest`, `@effect/openapi-generator` and the `@effect/platform-node*` peers pnpm auto-installs for the generator, all 4.0.1 published 2026-10-04/05, removable from 2026-10-12 — an auto-installed peer under the gate fails `pnpm install --frozen-lockfile` just like a direct dependency; check a publish date with `npm view <pkg> time --json` and read the version key — `npm view <pkg>@<v> time.<v>` prints nothing). `allowBuilds` disables install scripts for esbuild, workerd, sharp and msgpackr-extract.
- **Never bump `undici` across a major.** `setGlobalDispatcher()` reaches Node's built-in `fetch` only through a versioned global symbol (`Symbol.for('undici.globalDispatcher.1')` on Node 24). A different undici major can register under a different symbol — undici 8 did — and then `MockAgent` silently stops intercepting and tests hit the real network. Check `process.versions.undici` and raise the major only when Node's bundled one does (Dependabot ignores its majors).
- Bump coupled packages together: `effect` + `@effect/vitest` + `@effect/openapi-generator` (both peer on `^<effect version>`; run `pnpm run codegen:cloudflare` after, and `@effect/vitest` also pins one vitest major — `>=5 <6` since rc.113 — so an `effect` bump can force a vitest major; check with `npm view @effect/vitest@<version> peerDependencies` and `pnpm peers check`); `vitest` + `@vitest/coverage-v8` (it peers on the exact vitest version); `@effect/tsgo` + `oxlint` + `oxlint-tsgolint` (the patch is version-coupled — re-run `pnpm install` after). Dependabot's `effect`, `vitest` and `ox` groups do this. Release notes: `node_modules/effect` ships no CHANGELOG — read `repos/effect/packages/<effect|vitest|tools/openapi-generator>/CHANGELOG.md` after `pnpm run sync:effect`; for `@effect/tsgo` there is no changelog either, so compare tags on GitHub (`gh api 'repos/Effect-TS/tsgo/compare/@effect/tsgo@<old>...@effect/tsgo@<new>'`). A bump of a runtime dependency (`effect`, `@actions/core`) changes `dist/`, so rebuild and commit it with the bump.
- **TypeScript 7 only.** `typescript` is the Go-native 7.x: it ships the `tsc` binary (`tsc:check`, `tsc:ls`, the LSP, CI) but no `import ts from 'typescript'` compiler API (7.0 exports only `typescript/unstable/*`). Don't add a dev tool that needs that API — check its `peerDependencies` and that it runs — and don't reinstall TypeScript 5/6 beside it. `graphql-codegen` (loading `graphql.config.ts`), `knip` (oxc-parser), `tsx`, `@effect/openapi-generator` and `oxlint-tsgolint` run without it. `openapi-typescript` needed it and is discontinued (openapi-ts/openapi-typescript#2874, which also covers `openapi-fetch`); `@effect/openapi-generator` replaced both.

## Effect language service (`@effect/tsgo`)

- It patches binaries in place: `prepare` runs `effect-tsgo patch --typescript --oxlint` on every install, patching the platform `tsc` under `typescript` and the `oxlint` / `oxlint-tsgolint` binaries. `effect-tsgo unpatch` reverses it.
- Effect diagnostics come from `pnpm run lint`, not `tsc:check` — `tsconfig.json` sets the `@effect/language-service` plugin's `"diagnostics": false` so they aren't reported twice ([docs](https://effect.website/docs/v4/getting-started/devtools#oxlint)).
- The TigerStyle rules (`max-lines-per-function`, `max-depth`, `curly`, `no-magic-numbers`, …) and their test and fixture overrides are explained in `tiger-style.md`. `.oxlintrc.json` is JSONC with comments, so edit it textually rather than through `JSON.parse`.
- `.oxlintrc.json` adds `effecttsgo` to `plugins` and extends only the `correctness` + `antipattern` presets from `node_modules/@effect/tsgo/oxlint-presets/`; `effect-native`, `style` and `recommended` are excluded on purpose (~140 warnings on every `async` function, `process.env` read and `node:*` import). Preset rules are `warn` and `lint` has no `--max-warnings`, so they don't fail CI.
- The `tsconfig.json` plugin name `@effect/language-service` isn't an installed package (`@effect/tsgo` provides it) — hence its `ignoreDependencies` entry in `knip.json`.
- Standalone check: `pnpm exec effect-tsgo diagnostics --project tsconfig.json`.
- A `pnpm install` that fails in `prepare` is this patch failing: run `pnpm exec effect-tsgo patch --typescript --oxlint` alone to see why, and check the install's exit status (piping it through `tail` hides it). `@effect/tsgo` 0.47.0 wrongly required its deprecated `--force` flag and broke every CI install until 0.47.2 (Effect-TS/tsgo#777); a fresh-install failure like that fails `main` too, so check `gh pr checks` before merging a tooling bump.
- `unicorn/numeric-separators-style` rejects `1_000` (groups only from five digits) and `unicorn/no-array-reverse` wants `toReversed()`.
- `no-magic-numbers` (`enforceConst`) also flags the factors of a computed constant (`const X = 8 * 1024 * 1024`) — write the literal (`8_388_608`) and say what it is in the comment (`bin/sync-effect.ts`).
- To see which rules an oxlint version has (name, category, type-aware), use `oxlint --rules --format=json`; plain `--rules` prints nothing when piped.

## Scripts

- Prefer `node path/to/script.ts` (native type-stripping, no extra dependency). It works when the script's **runtime** imports are only `node:*`, relative paths, `package.json`, npm packages or **type-only** `@/` aliases (`import type` is erased) — e.g. `node bin/deployments/index.ts`.
- Use `tsx` for anything that transitively imports `__generated__/gql/` (e.g. `tsx bin/sync-readme-versions.ts`): `graphql.ts` emits `export enum`, which type-stripping rejects, and `gql.ts` has a runtime `import * as types from './graphql.js'` that node won't remap to `.ts`. Neither is fixable — they're generated. `tsx` reads tsconfig paths, transforms enums and remaps extensions; `verbatimModuleSyntax` doesn't change any of this, and `#`-prefixed subpath imports only redirect the entry import.
- To try an Effect/Schema snippet ad hoc, write an `.mts` file under `.cache/` (gitignored) and run `pnpm exec tsx .cache/x.mts` — a file outside the repo can't resolve `effect`, and `tsx -e` fails on top-level `await`.
- A `bin/` script that is both importable (for tests) and executable wraps side effects in `if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href)` and exports pure functions (reference: `bin/sync-readme-versions.ts`). Its tests go in `__tests__/scripts/`. To call its exports ad hoc, import them from an `.mts` file run with `tsx` — `tsx -e` evaluates as CommonJS and fails on the script's top-level `await`.

## Bundling (`esbuild.config.js`)

- A banner adds a `createRequire` shim; `wrangler` is external; minification is syntax + whitespace only (`keepNames`); sourcemaps are on.
- The `sideEffectFree` plugin marks `undici` / `tunnel` side-effect-free so the unused OIDC proxy path pulled in by `@actions/core` → `@actions/http-client` is tree-shaken (~570 KB, 70% of each bundle). CommonJS deps without a `sideEffects` field are otherwise kept whole — enable esbuild's `metafile` and inspect it before blaming the bundler.

## Hooks and editor

- act is a pinned dev container feature (`ghcr.io/dhoeric/features/act`). `.actrc` picks the runner image so act never prompts, and `.github/act/workflow_dispatch.json` is the event payload `pnpm run act:d` passes — the action reads `repository.node_id` and `ref` from it. Run act with a dummy `-s GITHUB_TOKEN` to exercise the plumbing without touching real deployments.
- prek (`prek.toml`) formats and lints on commit. In CI, `.github/workflows/prek.yml` runs `prek run --all-files` on PRs and `main` (it replaced pre-commit.ci, which can't read `prek.toml`); keep its `prek-version` equal to the prek in `.devcontainer/Dockerfile`.
- Changing formatter/linter behavior or script paths → update the `oxc-format-and-lint` hook in `prek.toml` and the usage header of `.claude/scripts/pre-commit-oxc.sh` together.
- Claude Code LSP: the project plugin `typescript-7-lsp` (`.claude/marketplace/typescript-7-lsp/.lsp.json`) runs the patched `node_modules/.bin/tsc --lsp --stdio`, so it needs `pnpm install` first. `.claude/settings.json` registers its `cloudflare-pages-action` directory marketplace and enables it; Claude Code asks you to trust the marketplace on first run. Don't also enable the official `typescript-lsp` plugin — both claim `.ts`. Validate manifests with `claude plugin validate .claude/marketplace`.
- The `ponytail` plugin is an entry in the same directory marketplace (`.claude/marketplace/.claude-plugin/marketplace.json`), a GitHub source pinned by `sha`, enabled as `ponytail@cloudflare-pages-action`. An external plugin is not installed from project settings alone, so the dev container's `postCreateCommand` runs `claude plugin install ponytail --marketplace ./.claude/marketplace --scope project` (idempotent), and `.github/workflows/claude.yml` passes the same path as `plugin_marketplaces`. A git URL in either place installs the marketplace's default branch unpinned, and a `#tag` on a GitHub source fails the install because the CLI deep-compares it with the `extraKnownMarketplaces` entry in user settings, which has no ref. Upgrade by changing the `sha` (and description) in the manifest.
- Third-party agent skills are installed by the `skills` CLI into `.agents/skills/` (tracked, pinned by `skills-lock.json`) and symlinked from `.claude/skills/`; `pnpm run skills:update` refreshes them. The repo's own installable skill is `skills/github-actions-cloudflare-pages/` (see the docs rule).
- `repos/` must stay excluded from every tool — the repos rule has the table.

## Debugging

- `pnpm run start` runs the built deploy action with a `.env` modelled on `.env.example` (inputs as `INPUT_*` vars).
- Set `ACTIONS_STEP_DEBUG=true` to see `debug()` output.
- **Running `src/` code with a real token prints it.** `CommonInputs.layer` calls `setSecret`, which writes `::add-mask::<token>` to stdout — masked by a runner, plain text in a terminal or an agent's tool output. For an ad hoc script against the live API, drop those lines (`… | grep -v '^::add-mask::'`) or send stdout to a file you don't read back.
- Add `debugger` statements and run vitest under the Node inspector.
- `tsx` drops environment variables whose names aren't valid identifiers, so `INPUT_GITHUB-TOKEN=… tsx x.mts` leaves the input unset (`node` passes it through). To run `src/` code ad hoc with inputs, assign them at the top of the `.mts` file (`process.env['INPUT_GITHUB-TOKEN'] = process.env.GH_TOKEN_FOR_TEST`) or run the built `dist/` with `node`.
- A `tsc:check` error about a variable you just declared in `src/env.d.ts` (`comes from an index signature`) is the incremental cache: delete `.cache/.tsbuildinfo` and rerun.
- Shell settings for VS Code terminals go in `.devcontainer/zshrc` (appended to `~/.zshrc` by the Dockerfile), not `containerEnv`: VS Code's injected zsh shell integration resets `HISTFILE` to `~/.zsh_history` before sourcing `~/.zshrc`, which is how history silently stopped reaching the `zsh-history-*` volume. To check a prompt change without a rebuild, append the file to `~/.zshrc` and render with `print -P "${(e)${PROMPT/git_prompt_info/_omz_git_prompt_info}}"` in `zsh -i` — the public `git_prompt_info` is async and prints nothing outside a real prompt.
- `git commit` failing with `insufficient permission for adding an object to repository database .git/objects`, or `git fetch` with `unable to append to '.git/logs/…': Permission denied`, means something ran git as root in the devcontainer and left root-owned files. List them with `find .git ! -user "$(id -un)"` and hand them back with `sudo chown -R "$(id -un)" <those paths>`; don't work around it by skipping the fetch or committing elsewhere.
