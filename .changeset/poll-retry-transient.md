---
'github-actions-cloudflare-pages': patch
---

While waiting for a Cloudflare Pages deployment, retry a transient failure (no response, or a 5xx without a JSON body) on the same one-second schedule instead of failing the step after a successful upload. An error Cloudflare answers with still fails at once.
