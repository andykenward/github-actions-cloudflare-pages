[![test](https://github.com/andykenward/github-actions-cloudflare-pages/actions/workflows/test.yml/badge.svg)](https://github.com/andykenward/github-actions-cloudflare-pages/actions/workflows/test.yml) [![Check dist/](https://github.com/andykenward/github-actions-cloudflare-pages/actions/workflows/check-dist.yml/badge.svg)](https://github.com/andykenward/github-actions-cloudflare-pages/actions/workflows/check-dist.yml) [![release](https://github.com/andykenward/github-actions-cloudflare-pages/actions/workflows/release.yml/badge.svg)](https://github.com/andykenward/github-actions-cloudflare-pages/actions/workflows/release.yml) [![pre-commit.ci status](https://results.pre-commit.ci/badge/github/andykenward/github-actions-cloudflare-pages/main.svg)](https://results.pre-commit.ci/latest/github/andykenward/github-actions-cloudflare-pages/main)

# GitHub Action — Cloudflare Pages

Deploy your build output to [Cloudflare Pages] with [Wrangler], while tracking every release through [GitHub Environments] and [GitHub Deployment]. On a [pull request], it creates a preview deployment and comments the URL on the PR.

**Features**

- Deploy to [Cloudflare Pages].
- Track releases with [GitHub Environments] & [GitHub Deployment].
- Comment the deployment URL on pull requests.
- Delete old deployments with the companion [`/delete`](./delete/README.md) action.
- Run Wrangler from a subfolder via the `working-directory` input — handy for monorepos where `functions` isn't in the repo root.

## Quick start

1. Create a [Cloudflare Pages] project and an API token that can edit it.
2. **Manually create your [GitHub Environments]** (for example `production` and `preview`) — the action can't create them for you. See [Setup](#setup).
3. Add the Cloudflare values as repository secrets/variables, then add a workflow like the one below (this mirrors the official template in [.github/workflow-templates/deploy.yml](.github/workflow-templates/deploy.yml)):

```yaml
name: Cloudflare Pages Deploy
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# Deny all permissions by default; grant only what each job needs.
permissions: {}

jobs:
  deploy:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      actions: read # Only required for a private repo.
      contents: read
      deployments: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
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

The `github-environment` expression deploys the `main` branch to `production` and every other branch to `preview`. For a line-by-line breakdown of this expression — and how it relates to the Cloudflare `branch` input — see [GitHub Environments](#2-github-environments-required).

## Setup

### 1. Cloudflare

Create a [Cloudflare Pages] project, then give the action three values (store the token as a repository **secret** and the rest as **variables** or secrets):

- `cloudflare-api-token` — an API token with permission to edit Cloudflare Pages.
- `cloudflare-account-id` — your Cloudflare account ID.
- `cloudflare-project-name` — the Pages project to upload to.

### 2. GitHub Environments (required)

> [!IMPORTANT]
> This action does **not** create [GitHub Environments]. Creating them requires the GitHub API `administration:write` permission, which the action can't request — so you must create them manually. See [Creating an environment].

Create each environment you reference (for example `production` and `preview`), then select one per run with the `github-environment` input. A common pattern switches on the branch:

```yaml
github-environment: ${{ (github.ref == 'refs/heads/main' && 'production') || 'preview' }}
```

GitHub Actions has no `condition ? a : b` ternary, so this uses the `&&`/`||` idiom to get the same result. Read it as **"if on `main`, use `production`, otherwise use `preview`"**:

- `github.ref` is the full ref of the branch that triggered the run, e.g. `refs/heads/main` or `refs/heads/my-feature`.
- `github.ref == 'refs/heads/main'` is `true` only on the `main` branch.
- `A && B` returns `B` when `A` is true, so on `main` the expression so far is `'production'`; on any other branch it is `false`.
- `X || 'preview'` returns `X` unless `X` is falsy, so a `false` left side falls through to `'preview'`.

To map more branches to environments, extend the same pattern — for example, send `main` to `production`, `staging` to `staging`, and everything else to `preview`:

```yaml
github-environment: >-
  ${{ (github.ref == 'refs/heads/main' && 'production')
   || (github.ref == 'refs/heads/staging' && 'staging')
   || 'preview' }}
```

> [!NOTE]
> `github-environment` only sets the **GitHub** Environment the deployment is recorded against. Whether Cloudflare treats the upload as a production or preview deployment is decided separately, by the **branch name** — Cloudflare promotes the deployment to production only when the branch matches your Pages project's production branch. By default the branch is detected from the GitHub context; use the [`branch`](#custom-branch-name) input to override it. The two inputs are independent, so make sure your branch logic and `github-environment` logic agree on what counts as "production".

### 3. Permissions

When using the workflow's built-in [`GITHUB_TOKEN`] for the `github-token` input, grant these [permissions]:

```yaml
permissions:
  actions: read # Only required for a private GitHub repo.
  contents: read
  deployments: write
  pull-requests: write
```

## Inputs

| Input                     | Required | Description                                                                                                                   |
| ------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `cloudflare-api-token`    | yes      | Cloudflare API Token                                                                                                          |
| `cloudflare-account-id`   | yes      | Cloudflare Account ID                                                                                                         |
| `cloudflare-project-name` | yes      | Cloudflare Pages project to upload to                                                                                         |
| `directory`               | yes      | Directory of static files to upload                                                                                           |
| `github-token`            | yes      | Github API key, make sure to add the required permissions for this action.                                                    |
| `github-environment`      | yes      | GitHub environment to deploy to. You need to manually create this for the github repo                                         |
| `pr-number`               | no       | GitHub pull request number to comment on. If not set, the action auto-detects from the event payload.                         |
| `working-directory`       | no       | Directory to run wrangler cli from                                                                                            |
| `wrangler-version`        | no       | Wrangler version to use. Otherwise a default version from the action will be used.                                            |
| `branch`                  | no       | Branch name to use for Cloudflare Pages deployment. If not set, the branch is automatically detected from the GitHub context. |

## Outputs

| Output        | Description                                                                           |
| ------------- | ------------------------------------------------------------------------------------- |
| `id`          | Cloudflare Pages deployed id                                                          |
| `url`         | Cloudflare Pages deployed url                                                         |
| `environment` | Cloudflare Pages deployed environment `production` or `preview`                       |
| `alias`       | Cloudflare Pages deployed alias. Falls back to deployed url if deployed alias is null |
| `wrangler`    | Wrangler cli output                                                                   |

## Examples

Ready-to-use GitHub Workflow Templates live in [.github/workflow-templates/](.github/workflow-templates/):

- [deploy.yml](.github/workflow-templates/deploy.yml)
- [delete.yml](.github/workflow-templates/delete.yml)

### Fork pull requests with `workflow_run`

Pull requests from forks don't have access to secrets in the initial `pull_request` workflow. Use a second workflow triggered by `workflow_run` to deploy from the original repository context after the first workflow succeeds, and set the `pr-number` input so the action can find the right pull request to comment on.

```yaml
name: Deploy PR Preview (Fork Safe)
on:
  workflow_run:
    workflows: ['CI']
    types: [completed]

jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    permissions:
      contents: read
      deployments: write
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          repository: ${{ github.event.workflow_run.head_repository.full_name }}
          ref: ${{ github.event.workflow_run.head_sha }}

      - name: Deploy to Cloudflare Pages
        uses: andykenward/github-actions-cloudflare-pages@46d86e1caa6b86365a41d335db65a6936a1beb39 #v3.5.0
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          cloudflare-account-id: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
          cloudflare-project-name: ${{ vars.CLOUDFLARE_PROJECT_NAME }}
          directory: dist
          github-token: ${{ secrets.GITHUB_TOKEN }}
          github-environment: preview
          pr-number: # The PR number
```

The action supports the `workflow_run` event and uses its head commit SHA and branch for the deployment metadata.

### Custom branch name

You can override the automatically detected branch name with the `branch` input. This is useful with `workflow_run`: a fork pull request opened from the fork's `main` branch would otherwise deploy to your project's production branch and overwrite the production deployment. Giving each pull request its own branch name (for example `pr-123`) keeps it on a separate Cloudflare Pages preview.

**Do not** build the branch name from `github.event.workflow_run.pull_requests[0].number` — that array is empty for pull requests from forks ([community discussion #25220](https://github.com/orgs/community/discussions/25220)), which is the exact case this is meant to cover. Instead, save the PR number in the triggering `pull_request` workflow and read it back from an artifact in the `workflow_run` workflow.

In the `pull_request` workflow (the one named in `workflows:` of the `workflow_run` trigger), save the PR number alongside your build output:

```yaml
- name: Save PR number
  run: echo "${{ github.event.number }}" > pr-number.txt

- name: Upload PR number
  uses: actions/upload-artifact@v4
  with:
    name: pr-number
    path: pr-number.txt
```

Then, in the `workflow_run` workflow, download it and pass it to both `branch` and `pr-number`:

```yaml
jobs:
  deploy:
    if: ${{ github.event.workflow_run.conclusion == 'success' }}
    permissions:
      actions: read
      contents: read
      deployments: write
      pull-requests: write
    runs-on: ubuntu-latest
    steps:
      - name: Download PR number
        uses: actions/download-artifact@v4
        with:
          name: pr-number
          run-id: ${{ github.event.workflow_run.id }}
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Read PR number
        id: pr
        run: echo "number=$(cat pr-number.txt)" >> "$GITHUB_OUTPUT"

      - name: Deploy to Cloudflare Pages
        uses: andykenward/github-actions-cloudflare-pages@46d86e1caa6b86365a41d335db65a6936a1beb39 #v3.5.0
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          cloudflare-account-id: ${{ vars.CLOUDFLARE_ACCOUNT_ID }}
          cloudflare-project-name: ${{ vars.CLOUDFLARE_PROJECT_NAME }}
          directory: dist
          github-token: ${{ secrets.GITHUB_TOKEN }}
          github-environment: preview
          branch: pr-${{ steps.pr.outputs.number }}
          pr-number: ${{ steps.pr.outputs.number }}
```

This creates a Cloudflare Pages preview deployment with a branch name like `pr-123`, so each pull request — including those from forks — gets its own preview environment instead of overwriting production.

## Pull request comment

![pull request comment example](./docs/comment.png)

## Deleting deployments

Use the companion sub-action [`andykenward/github-actions-cloudflare-pages/delete`](./delete/README.md) to remove old deployments.

The GitHub Deployment payload this action creates includes the Cloudflare metadata the delete action needs:

```json
{
  "payload": {
    "cloudflare": {
      "id": "123",
      "projectName": "cloudflare-pages-project-name",
      "accountId": "123"
    },
    "url": "https://example.com",
    "commentId": "1234"
  }
}
```

## Debugging

GitHub provides two debug log levels — see [Action Debugging]. Enable them by [setting a repository secret]:

- **Step debug logs**: set `ACTIONS_STEP_DEBUG` to `true`. Debug events then appear in the [downloaded logs] and [web logs].
- **Runner diagnostic logs**: set `ACTIONS_RUNNER_DEBUG` to `true`. Extra diagnostic files then appear in the `runner-diagnostic-logs` folder of the [log archive][downloaded logs].

## Upgrading

Upgrading from an older version? Check [CHANGELOG.md](./CHANGELOG.md) for breaking changes.

## Related docs

- [GitHub Actions variables](https://docs.github.com/en/actions/learn-github-actions/variables) and [default environment variables](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)
- [TypeScript ESM Node](https://www.typescriptlang.org/docs/handbook/esm-node.html)

[Cloudflare Pages]: https://pages.cloudflare.com/
[Wrangler]: https://developers.cloudflare.com/workers/wrangler/
[pull request]: https://docs.github.com/en/pull-requests
[GitHub Environments]: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
[GitHub Deployment]: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
[Creating an environment]: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment#creating-an-environment
[permissions]: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions
[`GITHUB_TOKEN`]: https://docs.github.com/en/actions/security-guides/automatic-token-authentication
[Action Debugging]: https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#step-debug-logs
[setting a repository secret]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets
[downloaded logs]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#downloading-logs
[web logs]: https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#viewing-logs-to-diagnose-failures
