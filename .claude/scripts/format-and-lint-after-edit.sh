#!/usr/bin/env bash
set -uo pipefail

# Claude Code PostToolUse hook entrypoint for Write/Edit/MultiEdit.
#
# Reads the hook payload (JSON) from stdin, extracts the edited file path,
# then formats (always) and lints it via the shared pre-commit-oxc.sh script.
#
# Exit code contract (Claude Code PostToolUse):
#   0 -> success, or skip (no file path / file gone): nothing fed back
#   2 -> lint/format errors: stderr is fed back to the agent to fix
# Tool crashes (killed by a signal, exit >= 128) are swallowed so a transient
# tooling bug never repeatedly blocks the agent.
#
# AI agents: keep this in sync with the other wiring points (.claude/CLAUDE.md "Hook Sync Rule"):
# - .claude/settings.json (PostToolUse)
# - .claude/scripts/pre-commit-oxc.sh (shared formatter/linter; also the prek.toml hook)

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Claude Code passes hook data as JSON on stdin, not via environment variables.
file_path="$(jq -r '.tool_input.file_path // empty')"
if [[ -z "$file_path" || ! -f "$file_path" ]]; then
  exit 0
fi

output="$(bash "$script_dir/pre-commit-oxc.sh" "$file_path" 2>&1)"
code=$?

# Success, or a tool crash we don't want to surface as actionable feedback.
if [[ "$code" -eq 0 || "$code" -ge 128 ]]; then
  exit 0
fi

# Lint/format errors: surface them to the agent (exit 2 feeds stderr back).
printf '%s\n' "$output" >&2
exit 2
