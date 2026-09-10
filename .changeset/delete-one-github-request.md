---
"github-actions-cloudflare-pages": patch
---

perf: the delete action marks each GitHub deployment inactive and deletes it (and its comment) in one GraphQL request instead of two.
