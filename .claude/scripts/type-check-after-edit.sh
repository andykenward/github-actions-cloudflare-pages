#!/usr/bin/env bash
set -uo pipefail

# Claude Code PostToolUse hook for TypeScript type-checking after Write/Edit/MultiEdit.
#
# Runs as an async "rewake" hook (asyncRewake): it does NOT block the edit. The
# whole-project type check (`pnpm run tsc:check`) runs in the background, and on
# type errors the hook exits 2 to wake the agent with the errors to fix.
#
# Exit code contract (asyncRewake PostToolUse):
#   0 -> no type errors, or skipped: the agent is not interrupted
#   2 -> type errors: hook output is fed back to wake the agent to fix them
#
# tsc checks the whole project, so this only runs for edits that can change type
# results; doc/config-only edits are skipped to avoid pointless background runs.
# The peer Stop hook (stop-type-check.sh) is the session-end safety net.
#
# AI agents: keep wiring points in sync (AGENTS.md "Hook Sync Rule"):
# - .claude/settings.json (PostToolUse + Stop)
# - .github/hooks/type-check-after-edit.json
# - .github/hooks/type-check-at-stop.json

if ! command -v pnpm >/dev/null 2>&1; then
  exit 0
fi

# Claude Code passes hook data as JSON on stdin, not via environment variables.
file_path="$(jq -r '.tool_input.file_path // empty')"
case "$file_path" in
  *.ts | *.tsx | *.cts | *.mts | *.js | *.jsx | *.cjs | *.mjs | *.json) ;;
  *) exit 0 ;;
esac

tsc_output="$(pnpm run tsc:check 2>&1)" || tsc_exit=$?

if [[ "${tsc_exit:-0}" -eq 0 ]]; then
  exit 0
fi

# Type errors: exit 2 so asyncRewake feeds these back to the agent.
printf 'TypeScript type errors must be fixed:\n\n%s\n' "$tsc_output"
exit 2
