---
"github-actions-cloudflare-pages": minor
---

fix(delete): the delete action now fails the step when any deployment could not be deleted. Previously it exited successfully even if every deletion failed, and the only sign was ❌ rows in the job summary. The remaining deployments are still deleted and the summary is still written. Per-deployment errors are now logged as warnings naming the deployment, instead of an `info` line that blamed the payload for every error.
