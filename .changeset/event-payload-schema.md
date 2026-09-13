---
"github-actions-cloudflare-pages": patch
---

fix: the event payload in `GITHUB_EVENT_PATH` is now checked against the fields the action reads for that event, so a `pull_request` or `workflow_run` payload missing one fails the step naming the field (`GITHUB_EVENT_PATH <file> is not a <event> payload: …`) instead of failing later with an opaque error.
