---
"github-actions-cloudflare-pages": patch
---

fix: the pull request comment puts Wrangler's output in a code block, so nothing in it is rendered as Markdown; interrupting or timing out a GitHub request now aborts it; the delete action's warnings say whether GitHub ran none of its mutations or only a later one failed.
