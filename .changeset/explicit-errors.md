---
'github-actions-cloudflare-pages': patch
---

Failures that were silently tolerated are now reported. The deploy action fails when Wrangler's output file exists but cannot be read (a missing file still means an old Wrangler); the delete action's job summary shows why a deployment or comment was left behind after its status was set, and both actions keep the JSON parse error as the cause of a "non-JSON response" failure. `keep-latest` is capped at 10000 and `pr-number` at 2147483647.
