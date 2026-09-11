---
"github-actions-cloudflare-pages": patch
---

fix: Cloudflare API errors now carry Cloudflare's reason in the failure message instead of separate annotations. A deployment the delete action finds already gone no longer leaves an error annotation on a successful run, and a non-JSON error response (e.g. an HTML 502 from Cloudflare's edge) reports its HTTP status instead of `Cannot read properties of undefined`.
