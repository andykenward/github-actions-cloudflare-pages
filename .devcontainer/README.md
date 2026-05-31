# Dev Container

This dev container provides a pre-configured TypeScript/Node environment with Claude Code and the GitHub CLI ready to use.

## Host requirements

The container bind-mounts a few host paths so your local Claude Code and `gh` credentials are available inside the container. `initializeCommand` creates these paths automatically on first launch if they don't exist, but you should authenticate them on the host **before** opening the project in the container — otherwise the container starts with empty/unauthenticated credentials.

### Required host setup

1. **Claude Code** — install and sign in on the host so that `~/.claude.json` and `~/.claude/` are populated:

   ```sh
   # https://docs.claude.com/en/docs/claude-code/setup
   claude  # follow the sign-in prompts
   ```

2. **GitHub CLI** — install and authenticate on the host so that `~/.config/gh/` contains valid credentials:
   ```sh
   # https://cli.github.com/
   gh auth login
   ```

If either step is skipped, the container will still build, but you'll need to re-authenticate inside the container (and for the read-only mounts below, that means editing the host files instead).

## Mounts

| Source (host)                         | Target (container)        | Mode       | Purpose                                            |
| ------------------------------------- | ------------------------- | ---------- | -------------------------------------------------- |
| `~/.claude.json`                      | `/home/node/.claude.json` | read-only  | Claude Code account/config (credentials)           |
| `~/.claude/`                          | `/home/node/.claude/`     | read-write | Claude Code working state: projects, todos, memory |
| `~/.config/gh/`                       | `/home/node/.config/gh/`  | read-only  | `gh` CLI credentials and config                    |
| `cloudflare-pages-action-zsh-history` | `/commandhistory`         | volume     | Persistent zsh history across container rebuilds   |

The credential mounts (`.claude.json`, `gh`) are **read-only** so a compromised dependency running inside the container cannot exfiltrate or tamper with host credentials. Re-authentication should be performed on the host.

The `.claude/` directory is read-write because Claude Code writes session state (projects, todos, memory) during normal use.

## Security notes

- `initializeCommand` runs on the **host** with your user privileges before the container starts. Review changes to [devcontainer.json](devcontainer.json) in PRs the same way you'd review CI workflow changes.
- Host credentials are exposed to any process running inside the container, including `pnpm install` postinstall scripts. The read-only flag limits write access but not read access — treat the container as a trust boundary for the credentials it can see.
