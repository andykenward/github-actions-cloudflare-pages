---
"github-actions-cloudflare-pages": minor
---

fix: failed deployments now fail the action, and deployment polling is bounded

Both actions previously called `run()` without awaiting it, so any rejection
became an unhandled promise rejection and the step exited `0` — a failed deploy
could report success. Failures are now surfaced through `setFailed`.

Deployment status polling was an unbounded loop with no timeout, and the
expected race where Cloudflare has not yet registered a deployment was treated
as a fatal error on the first poll rather than retried. Polling now retries that
case and gives up after 10 minutes instead of running until the job timeout.

Deletion of old deployments now runs at a bounded concurrency of 5 rather than
firing every deployment at Cloudflare and GitHub simultaneously.

Internally, the action entrypoints, their inputs, and the polling logic are now
built on Effect.
