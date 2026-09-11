---
"github-actions-cloudflare-pages": patch
---

fix: escape the values written to the job summary tables. A commit message, branch name, wrangler output or delete error was inserted as raw HTML, so a pull request could inject markup into the summary; link targets are now percent-encoded, escaped, and only rendered for `http(s)` URLs.
