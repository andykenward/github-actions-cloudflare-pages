---
'github-actions-cloudflare-pages': minor
---

Default Wrangler is now 4.160.0, which needs Node.js 22.12 or later on the runner's `PATH` (it was 22.0). It also picks up Wrangler's patched undici (GHSA-xjj6-f33q-929c). To keep an older Node.js, set `wrangler-version: 4.158.0`.
