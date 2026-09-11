# Microsoft's Ubuntu 24.04 dev container base — the OS of GitHub's ubuntu-slim
# runner — pinned by digest. It ships zsh + Oh My Zsh and the non-root `vscode`
# user (UID 1000), and builds an up-to-date git from source, so local git
# matches CI instead of lagging at the distro's release.
FROM mcr.microsoft.com/devcontainers/base:3.0.8-noble@sha256:d7c468679f45a52ad3673d06656b5bf16e488990b17216a1fa295d9e1f89d724

# prek — pre-commit hook manager, copied from the official distroless image.
# The digest is the multi-arch index, so amd64 and arm64 each get their own
# binary.
COPY --from=ghcr.io/j178/prek:0.4.11@sha256:b8fc85002e8b77d27fa2b8f305bbde52517a314a0d148d6cc816c53324f0d223 /prek /usr/local/bin/prek

# Mount points for the named volumes in devcontainer.json (Claude Code state,
# gh CLI auth, zsh history). A volume whose mount point is missing from the
# image is created root-owned, and the first write fails with EACCES. ~/.config
# is chowned too, since mkdir -p creates it as root.
RUN mkdir -p /home/vscode/.claude /home/vscode/.config/gh /home/vscode/.commandhistory \
    && chown -R vscode:vscode /home/vscode/.claude /home/vscode/.config /home/vscode/.commandhistory
