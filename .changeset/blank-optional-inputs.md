---
"github-actions-cloudflare-pages": patch
---

fix: treat a whitespace-only optional input as not supplied, as before the move to Effect. `branch: ' '` ran wrangler with `--branch ''`, and a blank `wrangler-version` installed `wrangler@` instead of the default.
