[![test](https://github.com/unlike-ltd/github-actions-cloudflare-pages/actions/workflows/test.yml/badge.svg)](https://github.com/unlike-ltd/github-actions-cloudflare-pages/actions/workflows/test.yml) [![Check dist/](https://github.com/unlike-ltd/github-actions-cloudflare-pages/actions/workflows/check-dist.yml/badge.svg)](https://github.com/unlike-ltd/github-actions-cloudflare-pages/actions/workflows/check-dist.yml) [![release](https://github.com/unlike-ltd/github-actions-cloudflare-pages/actions/workflows/release.yml/badge.svg)](https://github.com/unlike-ltd/github-actions-cloudflare-pages/actions/workflows/release.yml)

# Cloudflare Pages GitHub Action

This action deploys your build output to [Cloudflare Pages] using [Wrangler]. GitHub Environments and Deployments are used to track these deployments.

When used in context of a [pull request], the action will create a deployment for the pull request and add a comment with the URL of the deployment. On closing the [pull request], all the deployments for that pull request will be deleted from [Cloudflare Pages], GitHub Deployment and the related comment. **The action is only able to delete deployments & comments that it created, as it requires a certain payload in a GitHub deployment.**

- Deploy to [Cloudflare Pages].
- Use GitHub Environments & Deployments.
- Comment on pull requests with deployment URL.
- Delete Cloudflare Pages, GitHub deployments & comments, on pull request close.

## Usage

See the GitHub Workflow examples below or [deploy.yml]('./.github/workflows/deploy.yml') & [deploy-delete.yml]('./.github/workflows/deploy-delete.yml')

### `push` & `pull_request`

```yaml
# yaml-language-server: $schema=https://json.schemastore.org/github-workflow.json

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  publish:
    permissions:
      contents: read
      deployments: write
      pull-requests: write
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: Checkout
        uses: actions/checkout@v3
      - name: Setup Node.js & pnpm
        uses: unlike-ltd/github-actions/setup-pnpm@v0.0.2
        with:
          node-version: 18.x
      - name: Build
        run: pnpm run build
      - name: Publish to Cloudflare Pages
        uses: unlike-ltd/github-actions-cloudflare-pages@v0.1.0
        id: pages
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          cloudflare-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          cloudflare-project-name: ${{ vars.CLOUDFLARE_PROJECT_NAME }}
          directory: dist
          github-token: ${{ secrets.GITHUB_TOKEN }}
          github-environment: ${{ vars.CLOUDFLARE_PROJECT_NAME }} ${{ (github.ref == 'refs/heads/main' && '(Production)') || '(Preview)' }}
```

### `pull_request` `closed`

```yaml
# yaml-language-server: $schema=https://json.schemastore.org/github-workflow.json

name: 'delete deployments'
on:
  pull_request:
    types:
      - closed
    branches:
      - main

jobs:
  delete:
    permissions:
      contents: read
      deployments: write
      pull-requests: write
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - name: 'Delete Cloudflare Pages deployments'
        uses: unlike-ltd/github-actions-cloudflare-pages@v0.1.0
        with:
          cloudflare-api-token: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          cloudflare-account-id: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          cloudflare-project-name: ${{ vars.CLOUDFLARE_PROJECT_NAME }}
          directory: 'example/dist'
          github-token: ${{ secrets.GITHUB_TOKEN }}
          github-environment: ${{ vars.CLOUDFLARE_PROJECT_NAME }} ${{ (github.ref == 'refs/heads/main' && '(Production)') || '(Preview)' }}
```

## Inputs

```yaml
cloudflare-api-token:
  description: 'Cloudflare API Token'
  required: true
cloudflare-account-id:
  description: 'Cloudflare Account ID'
  required: true
cloudflare-project-name:
  description: 'Cloudflare Pages project to upload to'
  required: true
directory:
  description: 'Directory of static files to upload'
  required: true
github-token:
  description: 'Github API key'
  required: true
github-environment:
  description: 'GitHub environment to deploy to. You need to manually create this for the github repo'
  required: true
```

## Outputs

```yaml
id:
  description: 'Cloudflare Pages deployed id'
  value: ${{ steps.action.outputs.id }}
url:
  description: 'Cloudflare Pages deployed url'
  value: ${{ steps.action.outputs.url }}
environment:
  description: 'Cloudflare Pages deployed environment "production" or "preview"'
  value: ${{ steps.action.outputs.environment }}
alias:
  description: 'Cloudflare Pages deployed alias. Fallsback to deployed url if deployed alias is null'
  value: ${{ steps.action.outputs.alias }}
```

## Comment Example

![pull request comment example](./docs/comment.png)

## Deleting Deployments

Deployments are only deleted when the GitHub Action Event triggered is `pull_request` and the event payload action is `closed`.

It will only delete deployments that it created for that pull request. This is because it requires a certain payload in a GitHub deployment response.

### GitHub Deployment payload example response

```json
{
  "payload": {
    "cloudflareId": "1234",
    "url": "https://example.com",
    "commentId": "1234"
  }
}
```

## Debugging

[Action Debugging](https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#step-debug-logs)

### How to Access Step Debug Logs

This flag can be enabled by [setting the secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets) `ACTIONS_STEP_DEBUG` to `true`.

All actions ran while this secret is enabled will show debug events in the [Downloaded Logs](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#downloading-logs) and [Web Logs](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#viewing-logs-to-diagnose-failures).

### How to Access Runner Diagnostic Logs

These log files are enabled by [setting the secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets) `ACTIONS_RUNNER_DEBUG` to `true`.

All actions ran while this secret is enabled contain additional diagnostic log files in the `runner-diagnostic-logs` folder of the [log archive](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#downloading-logs).

## Docs

[GitHub Action Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
[GitHub Action Default Environment variables](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)

## ESM

[TypeScript ESM Node](https://www.typescriptlang.org/docs/handbook/esm-node.html)

[Cloudflare Pages]: https://pages.cloudflare.com/
[Wrangler]: https://developers.cloudflare.com/workers/wrangler/
[pull request]: https://docs.github.com/en/pull-requests
