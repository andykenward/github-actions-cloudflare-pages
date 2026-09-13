---
'github-actions-cloudflare-pages': minor
---

Add the `wrangler-comment-output` input to the deploy action. Set it to `false` to leave the Wrangler CLI output out of the pull request comment; the `wrangler` output and the job summary still have it. Defaults to `true`, so existing comments are unchanged.
