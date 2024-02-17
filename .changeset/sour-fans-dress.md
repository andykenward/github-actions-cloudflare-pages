---
"github-actions-cloudflare-pages": minor
---

Now polls the Cloudflare Pages API deployments endpoint every 1 second for the current status of the matching commit hash, if the status is not "idle" it will stop polling and continue the action. This fixes the issue #222 , where the PR comment would have the wrong preview URL.

CLOSES #222
