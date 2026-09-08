---
"github-actions-cloudflare-pages": patch
---

fix: decode deployment payloads supplied as JSON strings. The payload was returned unparsed but typed as an object, so deletion silently read `undefined` fields.
