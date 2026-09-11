---
paths:
  - '.github/**'
---

# GitHub workflows

## Hygiene (enforced by zizmor, `.github/workflows/zizmor.yml`)

- Pin every action to a full commit SHA with a `#vX.Y.Z` comment.
- Default to `permissions: {}` at workflow level and grant per job (a few read-only workflows, such as `test.yml` and `check-dist.yml`, set `contents: read` instead).
- Use `persist-credentials: false` on every checkout.
- zizmor's `inputs` is an allowlist (`.github action.yml delete/action.yml`) — it has no exclude setting, and its default `.` would scan `repos/*/.github/`.

## Commits made by workflows

- The `Main` and `Branches` rulesets enforce `required_signatures` — `Branches` covers every branch. Use `sign-commits: true` on `peter-evans/create-pull-request` and push with a GitHub App token (as `update.yml` does), so the PRs also trigger CI.
- `git commit-tree` doesn't sign unless given `-S`, and `git subtree` can't pass it — so subtree commits are always unsigned.

## What runs

- `test.yml` runs only `lint`, `tsc:check` and `test:ci` — not knip, format or codegen drift.
- `check-dist.yml` rebuilds and fails if the committed `dist/` differs.
- `prek.yml` runs `prek run --all-files` on PRs and `main`; keep its `prek-version` equal to the prek in `.devcontainer/Dockerfile`.
- `deploy.yml`, `deploy-main.yml` and `deploy-delete.yml` dogfood the action (`uses: ./`, `./delete`) against `example/`. Only `deploy.yml` skips fork PRs.
- `codeql.yml` runs CodeQL as advanced setup, because default setup can't exclude `repos/` (`.github/codeql/codeql-config.yml` `paths-ignore`).
- **Release** (`release.yml`): after `test` passes on `main`, changesets/action opens the "Version Packages" PR; merging it runs `pnpm release` (`pnpm run all && changeset publish`). The package is private, so "publish" means a git tag + GitHub release. A `v*` tag triggers `sync-readme-versions.yml`, which PRs the new pinned SHA into the READMEs and `.github/workflow-templates/`.
- `update.yml` (weekly) opens PRs refreshing webhook payloads, generated types and the GitHub GraphQL schema.
- `sync-effect.yml` opens a PR re-snapshotting `repos/effect` when `dependencies.effect` changes on `main` — see the repos rule.

## Dependabot (`.github/dependabot.yml`)

- Groups bump coupled packages together (`effect` + `@effect/vitest`; `@effect/tsgo` + `oxlint` + `oxlint-tsgolint`).
- `undici` majors are ignored on purpose — see the tooling rule.
- `exclude-paths: ['repos/**']` stops version updates for the vendored source. It doesn't affect alerts: the dependency graph still reads `repos/effect/pnpm-lock.yaml`.
