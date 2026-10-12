---
'github-actions-cloudflare-pages': patch
---

Log wrangler's stderr on a successful deploy, so its warnings (for example a deprecated flag or a Node version notice) reach the step log instead of being dropped.
