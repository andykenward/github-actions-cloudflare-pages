---
"github-actions-cloudflare-pages": patch
---

fix: check the GitHub Environment and find the pull request while wrangler uploads. A missing environment now stops wrangler and fails the step straight away, instead of failing after a full deploy and leaving an orphaned Cloudflare deployment.
