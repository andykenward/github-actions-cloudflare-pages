# Agent Hooks & Pre-commit Setup

This project uses three complementary hooks to enforce code quality automatically:

1. **Copilot PostToolUse Hook** (`format-and-lint-after-edit.json`)
2. **Copilot Stop Hook** (`type-check-at-stop.json`)
3. **Pre-commit Local Hook** (`.pre-commit-config.yaml`)

## Overview

| Hook                           | Event       | Purpose                                                                      | Files                                                                                          |
| ------------------------------ | ----------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **format-and-lint-after-edit** | PostToolUse | Runs oxfmt then oxlint after agent edits individual files in VS Code Copilot | [.github/hooks/format-and-lint-after-edit.json](.github/hooks/format-and-lint-after-edit.json) |
| **type-check-at-stop**         | Stop        | Runs tsc at agent session end; blocks if type errors found                   | [.github/hooks/type-check-at-stop.json](.github/hooks/type-check-at-stop.json)                 |
| **oxc-format-and-lint**        | pre-commit  | Runs oxfmt then oxlint on staged files before commit (all developers)        | [.pre-commit-config.yaml](.pre-commit-config.yaml)                                             |

## Shared Formatter/Linter Script

All three hooks delegate to:

- **[.github/hooks/scripts/pre-commit-oxc.sh](.github/hooks/scripts/pre-commit-oxc.sh)** — Shared entry point that formats and lints files

### Script Behavior

1. **Accepts file paths** as positional arguments (from pre-commit or PostToolUse).
2. **Formats with oxfmt**: All matched files (JS/TS/JSON/Markdown/GraphQL/YAML).
3. **Lints with oxlint**: Only JS/TS-family files (`.js`, `.jsx`, `.cjs`, `.mjs`, `.ts`, `.tsx`, `.cts`, `.mts`).
4. **Fails fast**: If oxfmt fails, oxlint is skipped and the hook exits with error.

## Setup & Installation

### For Copilot Hooks (VS Code)

Copilot automatically discovers hooks in `.github/hooks/*.json` when working in this workspace. No manual setup required.

### For Pre-commit (All Developers)

```bash
# Install pre-commit if not already done
pip install pre-commit

# Install the git hooks
pre-commit install

# (Optional) Test the hooks on staged files
pre-commit run --all-files
```

After installation, pre-commit will run automatically on `git commit` for files matching the configured patterns.

## When to Update This Setup

### Changing Formatter/Linter Behavior

If you modify any of these, keep them in sync:

1. [.pre-commit-config.yaml](.pre-commit-config.yaml) — entry point and file patterns
2. [.github/hooks/format-and-lint-after-edit.json](.github/hooks/format-and-lint-after-edit.json) — PostToolUse command
3. [.github/hooks/scripts/pre-commit-oxc.sh](.github/hooks/scripts/pre-commit-oxc.sh) — the shared script itself

Also update the usage header comment in [pre-commit-oxc.sh](.github/hooks/scripts/pre-commit-oxc.sh) to document where it's consumed.

**Project rule**: See [AGENTS.md](../AGENTS.md) Hook Sync Rule for details.

### Adding New File Types

Update the file pattern in [.pre-commit-config.yaml](.pre-commit-config.yaml):

```yaml
files: \.(js|jsx|cjs|mjs|ts|tsx|cts|mts|json|md|markdown|graphql|gql|yml|yaml)$
```

The script automatically handles linting only for JS/TS files, so adding format-only types is safe.

## Type Checking at Session End

The Stop hook ([type-check-at-stop.json](.github/hooks/type-check-at-stop.json)) enforces TypeScript checking:

- Runs `pnpm run tsc:check` when the Copilot agent finishes.
- **Blocks the session** if type errors are found, forcing the agent to resolve them.
- Allows normal session end if tsc passes.

This ensures the agent doesn't leave the codebase with type errors.

## Troubleshooting

### Hook not executing in pre-commit

1. Verify `pre-commit install` was run.
2. Check that the files match the pattern in [.pre-commit-config.yaml](.pre-commit-config.yaml).
3. Run `pre-commit run --all-files` to manually test.

### Hook not executing in Copilot

1. Verify the `.json` hook config is in `.github/hooks/`.
2. Open the Output panel in VS Code and select "GitHub Copilot Chat Hooks" to see hook output.
3. Check that the hook script path is correct (e.g., [.github/hooks/scripts/pre-commit-oxc.sh](.github/hooks/scripts/pre-commit-oxc.sh)).

### oxfmt or oxlint not found

If hooks fail with "command not found":

- **In pre-commit**: Run `pnpm install` to ensure dev dependencies are installed.
- **In Copilot**: Same — the workspace must have `pnpm install` completed.

## References

- [VS Code Agent Hooks Documentation](https://code.visualstudio.com/docs/copilot/customization/hooks)
- [Pre-commit Framework](https://pre-commit.com/)
- [oxfmt Documentation](https://oxc-project.github.io/docs/guide/oxfmt.html)
- [oxlint Documentation](https://oxc-project.github.io/docs/guide/oxlint.html)
