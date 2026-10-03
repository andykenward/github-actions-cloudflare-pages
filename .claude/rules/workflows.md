---
paths:
  - '.github/**'
---

# GitHub workflows

## Hygiene (enforced by zizmor, `.github/workflows/zizmor.yml`)

- Pin every action to a full commit SHA with a `#vX.Y.Z` comment.
- Default to `permissions: {}` at workflow level and grant per job (a few read-only workflows, such as `check-dist.yml`, set `contents: read` instead).
- Use `persist-credentials: false` on every checkout.
- zizmor isn't installed in the devcontainer, and Docker can't bind-mount `/workspaces`. Check locally by copying `.github/` into the container: `cid=$(docker create ghcr.io/zizmorcore/zizmor --offline /w/.github/workflows/test.yml) && docker cp <dir containing .github> "$cid:/w" && docker start -a "$cid"`. The file must sit under `.github/workflows/` — anywhere else zizmor parses it as a zizmor config.
- zizmor's `inputs` is an allowlist (`.github action.yml delete/action.yml`) — it has no exclude setting, and its default `.` would scan `repos/*/.github/`.

## Commits made by workflows

- The `Main` and `Branches` rulesets enforce `required_signatures` — `Branches` covers every branch. Use `sign-commits: true` on `peter-evans/create-pull-request` and push with a GitHub App token (as `update.yml` does), so the PRs also trigger CI.
- `sign-commits: true` rebuilds the commit through the REST API, one `git/blobs` request per changed file at one per second (Octokit's throttling plugin) — fine for a handful of files, hopeless for thousands. That is why `repos/effect` is synced by hand (`pnpm run sync:effect`, see the repos rule) and not by a workflow.
- `git commit-tree` doesn't sign unless given `-S`, and `git subtree` can't pass it — so subtree commits are always unsigned.

## What runs

- `test.yml` runs only `lint`, `tsc:check` and `test:ci --coverage` — not knip, format or codegen drift. `davelosert/vitest-coverage-report-action` then writes the coverage step summary and a PR comment (hence `pull-requests: write`) — vitest's `github-actions` reporter summarizes test results only, not coverage. It reads `.cache/coverage/coverage-{summary,final}.json`, so keep the `json-summary` and `json` reporters and `reportsDirectory` in `vitest.config.ts` in step. Fork PRs get a read-only token, so they get `comment-on: none` and only the summary.
- `check-dist.yml` rebuilds and fails if the committed `dist/` differs.
- `prek.yml` runs `prek run --all-files` on PRs and `main`; keep its `prek-version` equal to the prek in `.devcontainer/Dockerfile`.
- `deploy.yml`, `deploy-main.yml` and `deploy-delete.yml` dogfood the action (`uses: ./`, `./delete`) against `example/`. Only `deploy.yml` skips fork PRs. Deploy jobs need `timeout-minutes` above the action's 10-minute polling ceiling plus upload time (they use 15); delete jobs don't poll.
- `codeql.yml` runs CodeQL as advanced setup, because default setup can't exclude `repos/` (`.github/codeql/codeql-config.yml` `paths-ignore`).
- **Release** (`release.yml`): after `test` passes on `main`, changesets/action opens the "Version Packages" PR; merging it runs `pnpm release` (`pnpm run all && changeset publish`). The package is private, so "publish" means a git tag + GitHub release. A `v*` tag triggers `sync-readme-versions.yml`, which PRs the new pinned SHA into the READMEs and `.github/workflow-templates/`.
- `update.yml` (weekly) opens PRs refreshing webhook payloads, generated types and the GitHub GraphQL schema.

## Dependabot (`.github/dependabot.yml`)

- Groups bump coupled packages together (`effect` + `@effect/vitest`; `vitest` + `@vitest/coverage-v8`; `@effect/tsgo` + `oxlint` + `oxlint-tsgolint`).
- The github-actions entry groups `actions/*` + `github/*` and `changesets/action*` at every level, and everything else at minor/patch; other third-party majors stay individual PRs. Sub-actions of one repo (`changesets/action/pr-status`, `github/codeql-action/init`) are separate dependencies to Dependabot, so a repo used that way needs a `<owner>/<repo>*` group or every sub-action gets its own PR (#893–#895). First matching group wins, so keep the `*` catch-all last. `.github/workflow-templates/` isn't scanned (only `.github/workflows/` and `action.yml`), so its pins are `pnpm run sync:readme`'s job.
- `undici` majors are ignored on purpose — see the tooling rule.
- A `wrangler` (cloudflare group) PR only bumps `package.json` and the lockfile, so its `test` check fails until the rest is committed: check out the branch, run `pnpm run all` (sync-versions updates `WRANGLER_VERSION_DEFAULT`, `codegen:cloudflare` refreshes the Pages types, the build refreshes `dist/`), and push the result as a signed commit to the Dependabot branch (#901). Then read the regenerated `__generated__/types/cloudflare/pages.ts` diff for new enum values (`latest_stage.status`, `skip_reason`) that `src/common/cloudflare/deployment/status.ts` must handle.
- The npm `cooldown` must be at least `minimumReleaseAge` in `pnpm-workspace.yaml` (7 days). Dependabot picks the version with its own cooldown, then runs `pnpm install --lockfile-only`, and pnpm rejects anything younger than `minimumReleaseAge` with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, failing that dependency (2026-09-14, `skills` under a 3-day patch cooldown).
- `exclude-paths: ['repos/**']` stops version updates for the vendored source. It doesn't affect alerts (the dependency graph still reads `repos/effect/pnpm-lock.yaml`) nor the security-update PRs they raise; the separate `/repos/*` npm entry with `ignore: dependency-name: '*'` stops those, because `ignore` applies to security updates and `exclude-paths` doesn't (options reference, 2026-09-13). The alerts themselves still show under Security unless a repo-level auto-triage rule dismisses them by manifest path (see the repos rule).
