#!/usr/bin/env bash
set -euo pipefail

# Shared formatter/linter entrypoint used by:
# - .pre-commit-config.yaml (local hook: oxc-format-and-lint)
# - .github/hooks/format-and-lint-after-edit.json (Copilot PostToolUse)
# AI agents: keep both wiring points and this usage list in sync when behavior or paths change.

# pre-commit passes staged file paths as positional arguments.
# Exit fast when nothing matched this hook's file filter.
if [[ "$#" -eq 0 ]]; then
  exit 0
fi

# Step 1: Format every matched file first.
# If formatting fails, the script exits immediately because of `set -e`.
pnpm exec oxfmt --write "$@"

# Step 2: Build a list of files oxlint can analyze.
# We intentionally keep this separate from formatting so unsupported
# extensions can still be formatted by oxfmt when applicable.
lintable_files=()
for file in "$@"; do
  case "$file" in
    *.js|*.jsx|*.cjs|*.mjs|*.ts|*.tsx|*.cts|*.mts)
      # Only include files that still exist at commit time.
      if [[ -f "$file" ]]; then
        lintable_files+=("$file")
      fi
      ;;
  esac
done

# Step 3: Lint only when at least one supported file remains.
# This ensures lint runs only after successful formatting.
if [[ "${#lintable_files[@]}" -gt 0 ]]; then
  pnpm exec oxlint "${lintable_files[@]}"
fi
