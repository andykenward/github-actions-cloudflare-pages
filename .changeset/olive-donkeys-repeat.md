---
'github-actions-cloudflare-pages': patch
---

chore: replace deprecated `@octokit/webhooks-schemas` / `@octokit/webhooks-types` with `@octokit/openapi-webhooks` / `@octokit/openapi-webhooks-types`

Webhook event types now come from GitHub's official OpenAPI webhooks spec. `WorkflowEvent` and its payloads are derived from `@octokit/openapi-webhooks-types` at the type level rather than code generated, so `codegen:events` only emits the `EVENT_NAMES` runtime array. Nine event names GitHub has added since the old schema was last published are now recognised, including `projects_v2`, `repository_ruleset` and `sub_issues`.

The new schema is stricter about nullability, so a `workflow_run` event with a `null` `head_branch` now fails with `context: no head_branch in workflow_run event` instead of silently producing an empty ref.
