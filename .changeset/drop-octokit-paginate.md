---
'github-actions-cloudflare-pages': patch
---

List deployments with a plain `fetch` instead of Octokit, dropping the `@octokit-next/core` and `@octokit/plugin-paginate-rest` dependencies from the delete action. The listing now honours `GITHUB_API_URL`, so it works on GitHub Enterprise Server.
