---
"github-actions-cloudflare-pages": major
---
- **BREAKING CHANGES:** use the sub-action `unlike-ltd/github-actions-cloudflare-pages/delete` to delete deployments. The main action `unlike-ltd/github-actions-cloudflare-pages` no longer deletes any deployments.
- **BREAKING CHANGES:** new payload format saved to the GitHub deployments to allow for the sub-action `unlike-ltd/github-actions-cloudflare-pages/delete` to work. To support the older payload the action inputs of `cloudflare-account-id` & `cloudflare_project_name` are required. If an older payload is found and the action inputs are missing, it will silently error and continue; but output in the job summary the deployment.

