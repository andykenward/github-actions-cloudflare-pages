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
- `.github/zizmor.yml` holds the audits we don't act on, each with its reason: `self-repository` (the `$/` syntax breaks `act`, nektos/act#6189) and `dangerous-triggers` on `release.yml`. Findings in composite actions can't be ignored there, only inline.
- zizmor's `inputs` is an allowlist (`.github action.yml delete/action.yml`) — it has no exclude setting, and its default `.` would scan `repos/*/.github/`.

## Commits made by workflows

- The `Main` and `Branches` rulesets enforce `required_signatures` — `Branches` covers every branch. Use `sign-commits: true` on `peter-evans/create-pull-request` and push with a GitHub App token (as `update.yml` does), so the PRs also trigger CI.
- `sign-commits: true` rebuilds the commit through the REST API, one `git/blobs` request per changed file at one per second (Octokit's throttling plugin) — fine for a handful of files, hopeless for thousands. That is why `repos/effect` is synced by hand (`pnpm run sync:effect`, see the repos rule) and not by a workflow.
- `git commit-tree` doesn't sign unless given `-S`, and `git subtree` can't pass it — so subtree commits are always unsigned.

## What runs

- `test.yml` runs only `lint`, `tsc:check` and `test:ci --coverage` — not knip, format or codegen drift. `davelosert/vitest-coverage-report-action` then writes the coverage step summary and a PR comment (hence `pull-requests: write`) — vitest's `github-actions` reporter summarizes test results only, not coverage. It reads `.cache/coverage/coverage-{summary,final}.json`, so keep the `json-summary` and `json` reporters and `reportsDirectory` in `vitest.config.ts` in step. Fork PRs get a read-only token, so they get `comment-on: none` and only the summary.
- `check-dist.yml` rebuilds and fails if the committed `dist/` differs.
- `prek.yml` runs `prek run --all-files` on PRs and `main`; keep its `prek-version` equal to the prek in `.devcontainer/Dockerfile`.
- `deploy.yml`, `deploy-main.yml` and `deploy-delete.yml` dogfood the action (`uses: ./`, `./delete`) against `example/`. Only `deploy.yml` skips fork PRs. Deploy jobs set `timeout-minutes: 15` (why: the docs rule); delete jobs don't poll.
- `codeql.yml` runs CodeQL as advanced setup, because default setup can't exclude `repos/` (`.github/codeql/codeql-config.yml` `paths-ignore`).
- **Release** (`release.yml`): after `test` passes on `main`, changesets/action opens the "Version Packages" PR; merging it runs `pnpm release` (`pnpm run all && changeset publish`). The package is private, so "publish" means a git tag + GitHub release. A `v*` tag triggers `sync-readme-versions.yml`, which PRs the new pinned SHA into the READMEs and `.github/workflow-templates/`.
- `update.yml` (weekly) opens PRs refreshing webhook payloads, generated types and the GitHub GraphQL schema.

## Dependabot (`.github/dependabot.yml`)

- The `effect`, `vitest` and `ox` groups bump the coupled packages listed in the tooling rule together.
- The github-actions entry groups `actions/*` + `github/*` and `changesets/action*` at every level, and everything else at minor/patch; other third-party majors stay individual PRs. Sub-actions of one repo (`changesets/action/pr-status`, `github/codeql-action/init`) are separate dependencies to Dependabot, so a repo used that way needs a `<owner>/<repo>*` group or every sub-action gets its own PR (#893–#895). First matching group wins, so keep the `*` catch-all last. `.github/workflow-templates/` isn't scanned (only `.github/workflows/` and `action.yml`), so its pins are `pnpm run sync:readme`'s job.
- `undici` majors are ignored on purpose — see the tooling rule.
- A `wrangler` (cloudflare group) PR only bumps `package.json` and the lockfile, so its `test` check fails until the regenerated files are pushed to the Dependabot branch as a signed commit (#901). Follow `wrangler-upgrade.md` — its first step is that regeneration.
- pnpm 12 is supported by the updater since 2026-09-15 (dependabot-core#16169, #16170; GitHub changelog 2026-10-20), but GitHub's dependency graph still reads only the first document of a two-document `pnpm-lock.yaml` (#15904, open) — verified 2026-10-20 against a public pnpm 12 repo, whose lockfile the graph credits with pnpm's 15 own binaries and none of its 2016 project packages — which silences alerts and security PRs. `pmOnFail: ignore` in `pnpm-workspace.yaml` keeps the lockfile single-document (`warn` and `error` don't), so don't remove it until that issue closes; the cost is that pnpm no longer switches itself to `packageManager`'s version. And a security update of a transitive dependency locked on more than one major (`undici` is 6/7/8 here) fails with "resolved above the requested version" (#16434, open) — bump it by hand, as with `undici` already.
- The npm `cooldown` must be at least `minimumReleaseAge` in `pnpm-workspace.yaml` (7 days). Dependabot picks the version with its own cooldown, then runs `pnpm install --lockfile-only`, and pnpm rejects anything younger than `minimumReleaseAge` with `ERR_PNPM_NO_MATURE_MATCHING_VERSION`, failing that dependency (2026-09-14, `skills` under a 3-day patch cooldown).
- `exclude-paths: ['repos/**']` stops version updates for the vendored source. It doesn't affect alerts (the dependency graph still reads `repos/effect/pnpm-lock.yaml`) nor the security-update PRs they raise; the separate `/repos/*` npm entry with `ignore: dependency-name: '*'` stops those, because `ignore` applies to security updates and `exclude-paths` doesn't (options reference, 2026-09-13). The alerts themselves still show under Security unless a repo-level auto-triage rule dismisses them by manifest path (see the repos rule).
