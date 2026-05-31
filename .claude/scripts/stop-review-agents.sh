#!/usr/bin/env bash
set -euo pipefail

# Stop hook: prompts the agent to capture any learnings from this session in the
# right place — AGENTS.md (team-shared repo conventions) and auto-memory
# (MEMORY.md + memory files, for user preferences and project context).
# Only triggers when there are uncommitted changes — skips read-only sessions.
#
# Used by:
# - .claude/settings.json (Stop hook)

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
    "reason": "Before finishing: capture any learnings from this session in the right place.\n\n1. AGENTS.md — team-shared, repo-specific conventions, patterns, gotchas, or corrections to stale info.\n2. Auto-memory (MEMORY.md + memory files) — user preferences, feedback on how to work, and project context not derivable from the code.\n\nFor each: add what's new, fix what's stale, and skip what the repo already records. If both are already up to date, output a brief confirmation and the session can end."
  }
}
EOF

exit 0
