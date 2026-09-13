---
"github-actions-cloudflare-pages": patch
---

fix: a Cloudflare request that is interrupted or times out now aborts the underlying fetch, and every Cloudflare failure message names the request: a `success: false` envelope without errors reports `A request to the Cloudflare API (<url>) failed.` instead of `Cloudflare Delete Deployment: fail`, an empty 2xx reply reports its status (`failed: 204 No Content`), and a missing `result` reports `failed: response missing 'result'`.
