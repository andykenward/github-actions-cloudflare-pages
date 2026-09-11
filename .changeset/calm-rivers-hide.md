---
"github-actions-cloudflare-pages": patch
---

fix: check the HTTP status of GitHub GraphQL responses. GitHub returns JSON for a 401, so an auth failure parsed cleanly and the caller silently received `data: undefined`.
