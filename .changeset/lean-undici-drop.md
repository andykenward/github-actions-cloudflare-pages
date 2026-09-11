---
"github-actions-cloudflare-pages": patch
---

perf: bundled actions are ~70% smaller (808 KB → 233 KB each). The unused undici proxy code pulled in by `@actions/core`'s OIDC client is now tree-shaken.
