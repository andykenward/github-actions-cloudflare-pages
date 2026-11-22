---
'github-actions-cloudflare-pages': major
---

Keep one pull request comment, edited in place, and report failed deploys on the pull request.

- The comment is now a table, with linked URLs and a short commit SHA. Each deploy edits the comment an earlier run on the branch posted, rather than adding another.
- The GitHub Deployment is created as `in_progress` before Wrangler runs, then marked successful, failed or errored. A failed build updates the comment with a link to its build log: Cloudflare's, or the workflow run's when the build never reached Cloudflare.
- The deployment status follows Cloudflare's result: a deployment that went live after the step failed is still marked successful. A cancelled run (or one past `timeout-minutes`) marks its deployment as an error. The next deploy on the branch settles deployments a killed run left `in_progress`.
- Only the newest deployment on a branch updates the comment, so an older run that finishes late doesn't overwrite it.
- The delete action deletes a shared comment only once no remaining deployment uses it.

**Breaking:** the deployment payload is now version 3. It is written before Wrangler runs, so it no longer carries the Cloudflare deployment's id and URL: they are recorded on the deployment's status. Update the deploy and delete actions together. A delete action from an earlier release fails these deployments with `Payload is not valid`; from this release on, a payload from a newer release fails with a message saying to upgrade.
