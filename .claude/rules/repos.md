---
paths:
  - 'repos/**'
  - 'bin/sync-effect.ts'
  - '__tests__/scripts/sync-effect.test.ts'
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

| File                                       | Setting                                                                                                                                                                                                                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.oxfmtrc.json`, `.oxlintrc.json`          | `ignorePatterns`                                                                                                                                                                                                                                                           |
| `knip.json`                                | `ignore`                                                                                                                                                                                                                                                                   |
| `tsconfig.json`                            | `exclude`                                                                                                                                                                                                                                                                  |
| `vitest.config.ts`                         | `test.exclude`                                                                                                                                                                                                                                                             |
| `prek.toml`                                | `exclude`                                                                                                                                                                                                                                                                  |
| `.github/dependabot.yml`                   | `exclude-paths` on the root npm entry (version updates only) **and** a `/repos/*` npm entry with `ignore: dependency-name: '*'` — security-update PRs come from alerts on the dependency graph, which still reads its lockfile, and honor `ignore` but not `exclude-paths` |
| `.github/workflows/zizmor.yml`             | `inputs` allowlist (zizmor can't exclude; its default `.` scans `repos/*/.github/`)                                                                                                                                                                                        |
| `.github/codeql/codeql-config.yml`         | `paths-ignore` (why CodeQL runs as advanced setup via `codeql.yml`)                                                                                                                                                                                                        |
| `.gitattributes`                           | `linguist-vendored` (language stats), `linguist-generated` (collapsed in PR diffs), `-diff` (local `git diff`)                                                                                                                                                             |
| `.vscode/settings.json`                    | search, files, watcher and auto-import excludes                                                                                                                                                                                                                            |
| `package.json` `lint`, `pre-commit-oxc.sh` | `oxlint --disable-nested-config` — oxlint finds nested `.oxlintrc.json` files regardless of `ignorePatterns`, and `repos/effect/.oxlintrc.json` needs a plugin not installed here, so without the flag `pnpm run lint` fails outright                                      |

GraphQL codegen needs no entry — its `documents` globs only cover `src/` and `bin/`.

## Keeping it current

- On `main`, it is a copy of the `effect@<version>` release tag matching `dependencies.effect` in `package.json`, replaced in one ordinary commit. Other branches can drift until they merge.
- **Sync by hand** after an `effect` bump lands: on a branch with a clean tree, `pnpm run sync:effect` (`bin/sync-effect.ts`) fetches the tag, swaps the snapshot with `git rm` + `git read-tree --prefix`, and commits with your git, so the commit is signed as the rulesets require. It is a no-op when the versions already match, refuses `main` and a dirty tree, and fails on a missing tag before touching the tree. Push and open the PR yourself. `EFFECT_REPO` overrides the remote (the tests point it at a local `file://` repository).
- There is no workflow for this on purpose (one was removed on 2026-09-13): a workflow can't push a signed commit — an App has no signing key — and rebuilding the snapshot through GitHub's API doesn't fit a job: `peter-evans/create-pull-request` with `sign-commits` uploads one blob per file at one per second (~1,300 files per bump, 10-minute timeout), and `createCommitOnBranch` refuses requests over ~8 MiB (12 MiB got HTTP 499), drops file modes and can't express a type change.
- It is deliberately **not** a `git subtree`: `git subtree` finds its last squash by grepping commit messages for `git-subtree-dir:`, and GitHub's merge and squash messages quote every PR commit, so one merged pull poisons the lookup and later pulls conflict. `main` still carries such trailers from #866 — ignore them.
- Keep this in step with the "Vendored Effect source" section of `CONTRIBUTING.md`.
