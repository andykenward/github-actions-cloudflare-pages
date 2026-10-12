---
'github-actions-cloudflare-pages': patch
---

While waiting for a Cloudflare Pages deployment, also retry a 429 or 5xx that Cloudflare answers with a JSON error envelope, not only one without a body. Wrangler retries the same statuses.
