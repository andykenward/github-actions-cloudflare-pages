---
"github-actions-cloudflare-pages": minor
---

fix: fail the step when the Cloudflare Pages build fails or is canceled. Previously the action reported success — it commented on the pull request and marked the GitHub Deployment `SUCCESS` for a broken deploy. The outputs and job summary are still written, the error links to the Cloudflare build log, and no pull request comment or GitHub Deployment is created.
