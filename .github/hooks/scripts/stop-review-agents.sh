#!/usr/bin/env bash
set -euo pipefail

# Stop hook: prompts the agent to review AGENTS.md for any learnings from this session.
# Only triggers when there are uncommitted changes — skips read-only sessions.
#
# Used by:
# - .github/hooks/review-agents-at-stop.json (Stop)

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

# Skip if no working-tree changes (read-only session or everything already committed).
if git diff --quiet 2>/dev/null && git diff --cached --quiet 2>/dev/null; then
  exit 0
fi

cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "Stop",
    "decision": "block",
    "reason": "Before finishing: review AGENTS.md for any learnings from this session worth capturing.\n\nConsider:\n- New patterns, conventions, or gotchas discovered\n- Corrections to stale or inaccurate information\n- Non-obvious constraints or workflow steps that needed clarification\n- Anything that would have saved time if it had been documented at the start\n\nIf AGENTS.md is already up to date, output a brief confirmation and the session can end."
  }
}
EOF

exit 0
