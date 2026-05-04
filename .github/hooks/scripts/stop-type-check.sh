#!/usr/bin/env bash
set -euo pipefail

# Stop hook for TypeScript type checking.
# Runs `pnpm run tsc:check` and blocks the session if type errors are found,
# forcing the agent to resolve them before finishing.

if ! command -v pnpm >/dev/null 2>&1; then
  exit 0
fi

# Capture tsc output and exit code.
tsc_output=$(pnpm run tsc:check 2>&1) || tsc_exit=$?

# If tsc succeeded, allow the session to stop.
if [[ "${tsc_exit:-0}" -eq 0 ]]; then
  exit 0
fi

# tsc failed: block the session and report errors.
cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "decision": "block",
    "reason": "TypeScript type errors must be fixed before finishing:\n\n$tsc_output"
  }
}
EOF

exit 0
