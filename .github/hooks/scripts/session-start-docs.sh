#!/usr/bin/env bash
set -euo pipefail

# SessionStart hook: Inject documentation context about available guidance.
# Confirms which local markdown files the agent should reference.

cat <<'EOF'
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Documentation available in this workspace:\n- AGENTS.md: AI agent instructions, conventions, and workflows\n- .github/HOOKS.md: Hook ecosystem, format/lint/type-check automation, sync rules\n- README.md: Project overview and user-facing documentation\n- CHANGELOG.md: Version history and breaking changes\n- delete/README.md: Specific documentation for delete action\n- .github/agents/cf-pages-feature.agent.md: Feature agent customization\n\nRefer to these when making changes. Hooks enforce formatting, linting, and type checking automatically."
  }
}
EOF
