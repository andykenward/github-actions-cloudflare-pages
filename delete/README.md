# andykenward/github-actions-cloudflare-pages/delete

Delete deployments created by [`andykenward/github-actions-cloudflare-pages`](../README.md) for the current branch or pull request. When a [pull request] is closed, it removes that PR's deployments from [Cloudflare Pages] and [GitHub Deployment], along with the related comments.

> [!IMPORTANT]
> This action can only delete deployments and comments created by [`andykenward/github-actions-cloudflare-pages`](../README.md) — it relies on a specific payload stored in the GitHub deployment.

**Features**

- Delete the Cloudflare Pages deployment.
- Mark the GitHub deployment status `INACTIVE` once the Cloudflare Pages deployment is deleted.
- Delete the GitHub deployment and its related comment.
- Write a [job summary] of what was deleted.

## Quick start

Run this on `pull_request: closed` to clean up a PR's preview deployments when it's closed or merged (this mirrors the official template in [.github/workflow-templates/delete.yml](../.github/workflow-templates/delete.yml)):

```yaml
name: Cloudflare Pages Delete
on:
  pull_request:
    types: [closed]
    branches: [main]

# Deny all permissions by default; grant only what each job needs.
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
      - name: Delete Cloudflare Pages deployment
        uses: andykenward/github-actions-cloudflare-pages/delete@46d86e1caa6b86365a41d335db65a6936a1beb39 #v3.5.0
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Permissions

When using the workflow's built-in [`GITHUB_TOKEN`] for the `github-token` input, grant these [permissions]:

```yaml
permissions:
  actions: read # Only required for a private GitHub repo.
  contents: read
  deployments: write
  pull-requests: write
```

## Inputs

| Input                  | Required | Default | Description                                                                                                                              |
| ---------------------- | -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `cloudflare-api-token` | yes      | —       | Cloudflare API Token.                                                                                                                    |
| `github-token`         | yes      | —       | Github API key, make sure to add the required permissions for this action.                                                               |
| `github-environment`   | no       | —       | GitHub environment to delete deployments from. Leave undefined to delete all deployments referencing the current branch or pull_request. |
| `keep-latest`          | no       | `0`     | How many deployments to keep. Default is 0.                                                                                              |

## Examples

A ready-to-use template lives at [.github/workflow-templates/delete.yml](../.github/workflow-templates/delete.yml); the [Quick start](#quick-start) above is the same workflow.

## Upgrading

Upgrading from an older version? Check [CHANGELOG.md](../CHANGELOG.md) for breaking changes.

[pull request]: https://docs.github.com/en/pull-requests
[Cloudflare Pages]: https://pages.cloudflare.com/
[permissions]: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions
[`GITHUB_TOKEN`]: https://docs.github.com/en/actions/security-guides/automatic-token-authentication
[GitHub Deployment]: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
[job summary]: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary
