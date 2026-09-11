---
"github-actions-cloudflare-pages": patch
---

fix: clearer error messages. A `pr-number` with no matching pull request fails with `No pull request node id found for pr-number input: <number>`, as documented, instead of GitHub's raw error JSON; an unset `github-environment` names the input; and a missing `GITHUB_EVENT_PATH` file names the file instead of failing with a `TypeError`.
