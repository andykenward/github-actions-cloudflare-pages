---
"github-actions-cloudflare-pages": patch
---

fix: a failed Wrangler upload fails the step with Wrangler's own error output rather than the `Command failed: npx …` line that preceded it; a job summary that cannot be written reports `Create Deployment: <reason>`; and a rejection that is a plain object is reported as JSON instead of `[object Object]`.
