# GitHub Webhooks Payload Examples

Folder of `.json` files taken from [octokit/webhooks/payload-examples](https://github.com/octokit/webhooks/blob/main/payload-examples/README.md). They are webhook events and payload examples from `api.github.com`. Which we can use for testing.

You can update these example files by running the below command.

**Make sure you have a `GITHUB_TOKEN` in your `.env`. Otherwise you will hit the GitHub API rate limit very quickly.**

```bash
pnpm run download
```

See [../bin/download/payloads](../bin/download/payloads)