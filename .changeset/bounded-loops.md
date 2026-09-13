---
'github-actions-cloudflare-pages': minor
---

Every wait now has a fixed bound. The deploy action stops a `wrangler pages deploy` still running after 30 minutes (`Wrangler: timed out after 30m`) and polls Cloudflare at most 1000 times as well as for at most 10 minutes. The delete action follows at most 100 pages of GitHub's deployment listing and deletes at most the oldest 500 deployments per run, warning `delete - Deleting the oldest 500 of <n> deployments; re-run to delete the rest` when there are more.
