---
"github-actions-cloudflare-pages": patch
---

fix: bound concurrency to 5 when deleting deployments, rather than firing every deployment at Cloudflare and GitHub at once
