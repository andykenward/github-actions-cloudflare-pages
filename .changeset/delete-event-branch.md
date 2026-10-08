---
'github-actions-cloudflare-pages': patch
---

On a `delete` event, take the branch from the event payload. The run is on the default branch, so the delete action deleted the default branch's deployments instead of the deleted branch's.
