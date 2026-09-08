---
"github-actions-cloudflare-pages": patch
---

fix: retry instead of failing when Cloudflare has not yet registered a deployment. The first poll after wrangler returns treated this expected race as fatal.
