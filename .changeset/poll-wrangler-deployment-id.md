---
"github-actions-cloudflare-pages": patch
---

fix: poll the deployment wrangler created, by its id, rather than the newest deployment for the commit. On a re-run for the same commit, the action could report the previous deployment's id, URL and status. Wranglers too old to write an output file fall back to the old lookup.
