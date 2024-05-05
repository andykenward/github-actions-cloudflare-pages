# andykenward/github-actions-cloudflare-pages/delete

Delete deployments made using [`andykenward/github-actions-cloudflare-pages`](../README.md) for the current branch or pull request.

**The action is only able to delete deployments & comments that are created by `andykenward/github-actions-cloudflare-pages`, as it requires a certain payload in a GitHub deployment.**

On closing the [pull request], all the deployments for that pull request will be deleted from [Cloudflare Pages], [GitHub Deployment] and related comments.

- Delete Cloudflare Pages deployment.
- Update GitHub deployment status to `INACTIVE` on successfully deleting the Cloudflare Pages deployment.
- Delete GitHub deployment and related comment.
- Output [job summary] of deletion.

## Upgrading

If you have previous deployments using an older version of this GitHub Action please see the [CHANGELOG.md](../CHANGELOG.md) for breaking changes.

## Permissions

The [permissions] required for this GitHub Action when using the created [`GITHUB_TOKEN`] by the workflow for the `github-token` field.

```yaml
permissions:
  actions: read # Only required for a private GitHub Repo.
  contents: read
  deployments: write
  pull-requests: write
```

## Inputs

```yaml
cloudflare-api-token:
  description: 'Cloudflare API Token.'
  required: true
github-token:
  description: 'Github API key, make sure to add the required permissions for this action.'
  required: true
github-environment:
  description: 'GitHub environment to delete deployments from. Leave undefined to delete all deployments referencing the current branch or pull_request.'
  required: false
```

## Examples

See GitHub Workflow example below or [.github/workflow-templates/delete.yml](../.github/workflow-templates/delete.yml)

### `pull_request` `closed`

```yaml
# yaml-language-server: $schema=https://json.schemastore.org/github-workflow.json

name: 'Deployment Deletion'
on:
  pull_request:
    types:
      - closed
    branches:
      - main

jobs:
  deploy-delete:
    permissions:
      actions: read # Only required for private GitHub Repo
      contents: read
      deployments: write
      pull-requests: write
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Deploy deletion Cloudflare Pages
        uses: andykenward/github-actions-cloudflare-pages/delete@v2.2.0
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

[pull request]: https://docs.github.com/en/pull-requests
[Cloudflare Pages]: https://pages.cloudflare.com/
[permissions]: https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions#permissions
[`GITHUB_TOKEN`]: https://docs.github.com/en/actions/security-guides/automatic-token-authentication
[GitHub Deployment]: https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment
[job summary]: https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary
