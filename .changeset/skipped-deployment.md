---
'github-actions-cloudflare-pages': patch
---

Fail a deploy as soon as Cloudflare reports the build `skipped`, with Cloudflare's skip reason and the build log link, instead of polling until the 10-minute timeout.
