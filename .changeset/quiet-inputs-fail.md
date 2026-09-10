---
"github-actions-cloudflare-pages": patch
---

fix: a failed step now reports a one-line error, e.g. `Input required and not supplied: cloudflare-api-token`, instead of a stack trace or (in the delete action) the whole error object serialised as JSON. The full error is still logged when step debug logging is enabled.
