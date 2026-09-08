---
"github-actions-cloudflare-pages": minor
---

fix: failed deployments now fail the action. `run()` was called without being awaited, so a rejection became an unhandled promise rejection and the step exited `0` — a failed deploy reported success.
