---
"github-actions-cloudflare-pages": patch
---

fix: the delete action fails a row when GitHub rejects the whole delete request (e.g. a rate limit) with `Deleting GitHub deployment failed`. It was reported as deleted while the GitHub deployment remained.
