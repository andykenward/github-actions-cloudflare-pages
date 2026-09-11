---
"github-actions-cloudflare-pages": patch
---

fix: a `github-environment` that doesn't exist fails with `GitHub Environment: Not created for <name>`, as documented. GitHub reports it as a `NOT_FOUND` error, which was shown as raw JSON that pointed at a missing permission instead.
