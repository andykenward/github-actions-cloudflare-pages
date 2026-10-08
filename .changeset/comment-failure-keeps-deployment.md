---
'github-actions-cloudflare-pages': patch
---

When posting the pull request comment fails after a successful deploy, warn and still record the GitHub Deployment instead of failing the step. Without that record the delete action could never find and remove the Cloudflare deployment.
