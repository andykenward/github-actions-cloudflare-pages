---
name: github-actions-cloudflare-pages
description: Set up the andykenward/github-actions-cloudflare-pages GitHub Action to deploy a site to Cloudflare Pages — production deploys from the default branch, preview deploys with a pull request comment, fork-safe workflow_run deploys, and cleanup with its delete action. Use when adding, fixing or reviewing a GitHub Actions workflow that deploys to Cloudflare Pages with this action.
---

# Deploy to Cloudflare Pages with andykenward/github-actions-cloudflare-pages

Full docs: [README](https://github.com/andykenward/github-actions-cloudflare-pages#readme) · [delete action](https://github.com/andykenward/github-actions-cloudflare-pages/blob/main/delete/README.md) · [action.yml](https://github.com/andykenward/github-actions-cloudflare-pages/blob/main/action.yml)

## 1. Learn the project

- The build command and its output directory → `directory`. If Pages Functions live in a subfolder (`functions/` not at the repo root), that folder → `working-directory`, and `directory` is relative to it.
- The default branch → the production branch.
- Whether pull requests come from forks. Forks need the `workflow_run` variant (step 3).
- The Cloudflare account ID and Pages project name — ask the user if they aren't in the repo.

## 2. Do the steps outside the workflow file

These can't be expressed in YAML. Run them, or ask the user to — they need admin access to the repository:

```sh
# Only if there is no Pages project yet.
npx wrangler pages project create <project-name> --production-branch <default-branch>

# The token needs the "Cloudflare Pages: Edit" permission. gh prompts for it —
# never ask the user to paste the token into the conversation.
gh secret set CLOUDFLARE_API_TOKEN
gh variable set CLOUDFLARE_ACCOUNT_ID --body "<account-id>"
gh variable set CLOUDFLARE_PROJECT_NAME --body "<project-name>"

# The action can't create GitHub Environments, and a missing one fails the run.
gh api --method PUT "repos/{owner}/{repo}/environments/production"
gh api --method PUT "repos/{owner}/{repo}/environments/preview"
```

## 3. Write the workflow

Save as `.github/workflows/cloudflare-pages.yml`. Replace `main` with the default branch (in `on:` and in `github-environment`), add the build steps, and set `directory`:

```yaml
name: Cloudflare Pages Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.head_ref || github.run_id }}

permissions: {}

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 15 # The action waits up to 10 minutes for Cloudflare.
    permissions:
      actions: read # Only required for a private repo.
      contents: read
      deployments: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
      # Install dependencies and build the site here, e.g. `npm ci && npm run build`.
      - name: Deploy to Cloudflare Pages
        uses: andykenward/github-actions-cloudflare-pages@46d86e1caa6b86365a41d335db65a6936a1beb39 #v3.5.0
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          cloudflare-account-id: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
          cloudflare-project-name: ${{ vars.CLOUDFLARE_PROJECT_NAME }}
          directory: dist
          github-token: ${{ secrets.GITHUB_TOKEN }}
          github-environment: ${{ (github.ref == 'refs/heads/main' && 'production') || 'preview' }}
```

**Pull requests from forks**: fork runs get no secrets, so deploy from a second workflow triggered by `workflow_run`. Follow the README's [fork example](https://github.com/andykenward/github-actions-cloudflare-pages#fork-pull-requests-with-workflow_run) and [custom branch name](https://github.com/andykenward/github-actions-cloudflare-pages#custom-branch-name): save the PR number as an artifact in the `pull_request` workflow, then pass it to `pr-number` and `branch: pr-<number>`.

**Cleanup**: to delete a pull request's preview deployments when it closes, add a second workflow:

```yaml
name: Cloudflare Pages Delete
on:
  pull_request:
    types: [closed]
    branches: [main]

permissions: {}

jobs:
  delete:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      actions: read # Only required for a private repo.
      contents: read
      deployments: write
      pull-requests: write
    steps:
      - uses: andykenward/github-actions-cloudflare-pages/delete@46d86e1caa6b86365a41d335db65a6936a1beb39 #v3.5.0
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Rules

- Keep `uses:` pinned to a full commit SHA with its `#vX.Y.Z` comment. To upgrade, find the latest release with `gh release view --repo andykenward/github-actions-cloudflare-pages --json tagName`, then its commit with `gh api repos/andykenward/github-actions-cloudflare-pages/commits/<tag> --jq .sha`.
- Trigger only on `push`, `pull_request`, `workflow_dispatch` or `workflow_run` — any other event fails the step.
- Never build `pr-number` or `branch` from `github.event.workflow_run.pull_requests[0]`: it is empty for pull requests from forks.
- For `workflow_dispatch` and `workflow_run`, the step fails when no pull request matches. Set `pr-number`, or use `push` if a comment isn't wanted.
- Use only `github-environment` names that exist, and keep `timeout-minutes` at 15 or more.
- Cloudflare decides production vs preview from the branch, not from `github-environment` — the project's production branch must be the one mapped to `production`.

## Verify

After the first run (`gh run watch`), check:

- the step's `url` output and the job summary;
- the pull request comment, for pull request runs;
- a new deployment in the repository's Environments (`gh api "repos/{owner}/{repo}/deployments" --jq '.[0]'`).

## Troubleshooting

A failed or canceled Cloudflare build fails the step with `Create Deployment: the Cloudflare Pages build failed. Build log: <url>` — open that link for Cloudflare's build output. The full list of messages is in the [README](https://github.com/andykenward/github-actions-cloudflare-pages#troubleshooting).

| Log message                                                                | Fix                                                                                               |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `Input required and not supplied: <input>`                                 | Set the input. On a fork's `pull_request` run secrets are empty — use the `workflow_run` variant. |
| `GitHub Environment: Not created for <name>`                               | Create the environment (step 2), or fix the `github-environment` expression.                      |
| `GitHub Action event name '<name>' not supported.`                         | Trigger on `push`, `pull_request`, `workflow_dispatch` or `workflow_run`.                         |
| `No pull request found in workflow_run event matching head branch and sha` | A fork or branch with no pull request — pass `pr-number` (see the fork example).                  |
| `No pull request node id found for workflow_dispatch event`                | Dispatch from a branch with an open pull request, or set `pr-number`.                             |
| `… waiting for the deploy stage to complete`                               | Cloudflare didn't finish within 10 minutes — check the build in the Cloudflare dashboard.         |
| The job is cancelled at its time limit                                     | Raise `timeout-minutes` to at least 15.                                                           |
