---
"github-actions-cloudflare-pages": patch
---

fix: validate inputs before anything runs, reporting each as `Input '<name>' is invalid: …`. `pr-number` must be a positive whole number (`12abc` was read as `12`), `keep-latest` must be `0` or more (`-1` deleted only the oldest deployment), a missing `working-directory` is an invalid input rather than a crash, and a missing `github-environment` fails the deploy before Wrangler uploads anything.
