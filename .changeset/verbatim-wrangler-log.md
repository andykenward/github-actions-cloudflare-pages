---
"github-actions-cloudflare-pages": patch
---

security: wrangler's output is now logged inside a `stop-commands` block with a random token, so a line in it that looks like a workflow command (`::…`) is printed rather than executed by the runner.
