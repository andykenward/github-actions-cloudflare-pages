<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# GitHub Action to deploy to Cloudflare Pages

## Debugging

[Action Debugging](https://github.com/actions/toolkit/blob/main/docs/action-debugging.md#step-debug-logs)

### How to Access Step Debug Logs

This flag can be enabled by [setting the secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets) `ACTIONS_STEP_DEBUG` to `true`.

All actions ran while this secret is enabled will show debug events in the [Downloaded Logs](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#downloading-logs) and [Web Logs](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#viewing-logs-to-diagnose-failures).

### How to Access Runner Diagnostic Logs

These log files are enabled by [setting the secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets#creating-encrypted-secrets) `ACTIONS_RUNNER_DEBUG` to `true`.

All actions ran while this secret is enabled contain additional diagnostic log files in the `runner-diagnostic-logs` folder of the [log archive](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/managing-a-workflow-run#downloading-logs).

## Docs

[GitHub Action Variables](https://docs.github.com/en/actions/learn-github-actions/variables)
[GitHub Action Default Environment variables](https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables)

## ESM

[TypeScript ESM Node](https://www.typescriptlang.org/docs/handbook/esm-node.html)
