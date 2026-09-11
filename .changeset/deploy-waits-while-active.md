---
"github-actions-cloudflare-pages": patch
---

fix: keep polling while Cloudflare's deploy stage is still `active`. The action treated `active` as finished, so it could record a successful GitHub Deployment before Cloudflare had finished deploying.
