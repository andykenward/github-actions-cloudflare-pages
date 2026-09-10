---
"github-actions-cloudflare-pages": patch
---

security: register `cloudflare-api-token` and `github-token` with the runner's log masking. GitHub only masks values that come from `secrets.*` automatically, so a token passed from another step's output or an environment variable could previously appear unredacted in logs.
