---
paths:
  - 'repos/**'
  - '.github/workflows/sync-effect.yml'
  - '.github/dependabot.yml'
  - '.github/workflows/zizmor.yml'
  - '.github/workflows/codeql.yml'
  - '.github/codeql/**'
  - '.oxfmtrc.json'
  - '.oxlintrc.json'
  - 'knip.json'
  - 'tsconfig.json'
  - 'vitest.config.ts'
  - 'prek.toml'
  - '.gitattributes'
  - '.vscode/settings.json'
  - '.claude/scripts/pre-commit-oxc.sh'
---

# Vendored source (`repos/`)

`repos/effect/` is a plain snapshot of the Effect source — reference material for agents. Start at `repos/effect/packages/` (source + tests), `repos/effect/.agents/AGENTS.md`, `repos/effect/LLMS.md` and `repos/effect/MIGRATION.md`.

## Rules

- Don't edit it unless explicitly asked, and never import from it — application code imports the `effect` package.
- Never hand-edit it to "fix" drift — re-sync instead (below).

## Every tool must ignore it

Otherwise vitest collects ~900 vendored test files (and fails) and `tsc` gains ~1,500 files. When adding a vendored repo, add it to every entry:

| File                                       | Setting                                                                                                                                                                                                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.oxfmtrc.json`, `.oxlintrc.json`          | `ignorePatterns`                                                                                                                                                                                                                      |
| `knip.json`                                | `ignore`                                                                                                                                                                                                                              |
| `tsconfig.json`                            | `exclude`                                                                                                                                                                                                                             |
| `vitest.config.ts`                         | `test.exclude`                                                                                                                                                                                                                        |
| `prek.toml`                                | `exclude`                                                                                                                                                                                                                             |
| `.github/dependabot.yml`                   | `exclude-paths` (version updates only; alerts still read its lockfile)                                                                                                                                                                |
| `.github/workflows/zizmor.yml`             | `inputs` allowlist (zizmor can't exclude; its default `.` scans `repos/*/.github/`)                                                                                                                                                   |
| `.github/codeql/codeql-config.yml`         | `paths-ignore` (why CodeQL runs as advanced setup via `codeql.yml`)                                                                                                                                                                   |
| `.gitattributes`                           | `linguist-vendored` (language stats), `linguist-generated` (collapsed in PR diffs), `-diff` (local `git diff`)                                                                                                                        |
| `.vscode/settings.json`                    | search, files, watcher and auto-import excludes                                                                                                                                                                                       |
| `package.json` `lint`, `pre-commit-oxc.sh` | `oxlint --disable-nested-config` — oxlint finds nested `.oxlintrc.json` files regardless of `ignorePatterns`, and `repos/effect/.oxlintrc.json` needs a plugin not installed here, so without the flag `pnpm run lint` fails outright |

GraphQL codegen needs no entry — its `documents` globs only cover `src/` and `bin/`.

## Keeping it current

- On `main`, it is a copy of the `effect@<version>` release tag matching `dependencies.effect` in `package.json`, replaced in one ordinary commit. Other branches can drift until they merge, because the sync only runs on `main`.
- `.github/workflows/sync-effect.yml` runs on `main` pushes that touch `package.json` or the workflow itself (and on dispatch). It compares `repos/effect/packages/effect/package.json` `version` with `dependencies.effect` and, if they differ, opens a signed PR replacing the snapshot. A merged Dependabot `effect` bump is therefore followed by a sync PR, which can be merged any way.
- It is deliberately **not** a `git subtree`: `git subtree` finds its last squash by grepping commit messages for `git-subtree-dir:`, and GitHub's merge and squash messages quote every PR commit, so one merged pull poisons the lookup and later pulls conflict. `main` still carries such trailers from #866 — ignore them.
- To sync by hand, from the repo root with a clean tree:

  ```sh
  tag="effect@$(jq -r .dependencies.effect package.json)"
  git fetch --no-tags https://github.com/Effect-TS/effect.git "refs/tags/$tag"
  git rm -rq --ignore-unmatch repos/effect && git read-tree --prefix=repos/effect/ -u FETCH_HEAD
  ```

- Keep this in step with the "Vendored Effect source" section of `CONTRIBUTING.md`.
