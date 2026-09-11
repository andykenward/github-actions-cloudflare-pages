---
"github-actions-cloudflare-pages": patch
---

fix: stop writing the Cloudflare API token into the global process environment. It is now scoped to the wrangler child process, and both API tokens are redacted.
