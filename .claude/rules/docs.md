---
paths:
  - 'README.md'
  - 'delete/README.md'
  - 'CONTRIBUTING.md'
  - 'action.yml'
  - 'delete/action.yml'
  - '.github/workflow-templates/**'
  - 'skills/**'
  - '.claude/**/*.md'
---

# Docs and instructions

## User docs

- `README.md` documents the deploy action; `delete/README.md` the delete action. Adding, changing or removing an input or output — or any user-visible behavior — means updating the matching Inputs/Outputs table and examples.
- Keep the input and output descriptions in `action.yml` / `delete/action.yml` in step with the README tables — agents and the Marketplace read `action.yml` first. Don't hardcode the default Wrangler version there: `bin/sync-versions.ts` only updates `src/common/inputs.ts`.
- Never hand-edit the pinned `andykenward/...@<sha> #vX.Y.Z` refs — `bin/sync-readme-versions.ts` (`pnpm run sync:readme`) maintains them. A new file with pinned refs goes in both its `files` list and the `add-paths` of `.github/workflows/sync-readme-versions.yml`.
- `skills/github-actions-cloudflare-pages/SKILL.md` is the installable skill for agents setting the action up in other projects (`npx skills add andykenward/github-actions-cloudflare-pages`). Keep it in step with the README's setup, examples and error messages, and link to docs with absolute GitHub URLs — it's installed outside this repo. It must stay the only skill under `skills/`: the `skills` CLI searches the whole repo, including `repos/effect`, when it finds none there. Check what it discovers with `pnpm exec skills add . --list`.
- `CONTRIBUTING.md` is for contributors: setup, commands, the pull request checklist and the vendored Effect source. Keep its checklist in step with `.claude/CLAUDE.md` ("Before you finish") and its vendored-source section with `.claude/rules/repos.md`. Keep contributor material out of the READMEs.
- Facts the docs must get right:
  - GitHub Environments must be created manually — the action can't create them (that needs `administration:write`).
  - With `GITHUB_TOKEN`, grant `contents: read`, `deployments: write`, `pull-requests: write`, plus `actions: read` for private repos.
  - Supported events: `push`, `pull_request`, `workflow_dispatch`, `workflow_run`.
  - A failed or canceled Cloudflare build fails the step, as does one still running after 10 minutes. The outputs and job summary are written first; no pull request comment or GitHub Deployment is created.
  - The README's Troubleshooting table quotes the actions' exact error messages. Changing a message in `src/` means updating that table, `delete/README.md`'s, and the skill's.
  - A deploy job's `timeout-minutes` must exceed the action's 10-minute polling ceiling plus upload time, or the runner kills the job before the action can report. Agents copy examples verbatim.
  - The deployment payload embeds Cloudflare metadata so the delete action can find deployments (`src/common/github/deployment/types.ts`).
- **`workflow_run` + fork PRs**: `github.event.workflow_run.pull_requests` is **empty for fork PRs** ([community #25220](https://github.com/orgs/community/discussions/25220)). Never derive `pr-number` or `branch` from `pull_requests[0]` in docs or examples — it silently resolves to empty for exactly the fork case those examples target. Save the number in the triggering `pull_request` workflow and hand it over as an artifact (`upload-artifact` → `download-artifact` with `run-id: ${{ github.event.workflow_run.id }}` + `github-token`). See "Custom branch name" in `README.md`.

## Markdown

- Wrap `__dunder__` path tokens in backticks — ``[`__generated__/`](__generated__/)`` — or the formatter reads `__x__` as bold and mangles the link text and target.

## These instructions (`.claude/CLAUDE.md`, `.claude/rules/`)

- `CLAUDE.md` loads every session: keep it under 200 lines and limited to session-wide rules. Put anything that matters for only part of the codebase in a rule here, with `paths:` frontmatter.
- Write imperative, specific bullets with repo-root paths, and a short reason when a rule isn't obvious. Don't restate what the code shows or what another file already says.
- Adding, renaming or re-scoping a rule → update the rules table in `CLAUDE.md`.
- `prek.toml` excludes `.claude/`, so these files are never formatted on commit — run `pnpm exec oxfmt --write .claude/CLAUDE.md .claude/rules/*.md` after editing them.
