# Base image pinned by digest for reproducibility. Bumping the node version
# means updating both the tag and the digest (see `docker pull` output).
FROM node:24.16.0-bookworm-slim@sha256:242549cd46785b480c832479a730f4f2a20865d61ea2e404fdb2a5c3d3b73ecf

# System packages. Individual versions are not pinned — the digest-pinned base
# image plus Docker's layer cache provide reproducibility in practice.
#   - libatomic1: required by the pnpm standalone binary (glibc build).
#   - zsh + zsh-autosuggestions: interactive shell setup, configured via zshrc.
#   - chsh: make zsh the login shell for the `node` user so VS Code terminals
#     and any `docker exec` sessions land in zsh by default.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget gnupg ca-certificates apt-transport-https \
    libatomic1 git bash zsh zsh-autosuggestions \
    && rm -rf /var/lib/apt/lists/* \
    && chsh -s /usr/bin/zsh node

# Persisted zsh history. /commandhistory is mounted as a named volume in
# devcontainer.json so history survives container rebuilds. The directory must
# exist and be owned by `node` before the volume mounts, otherwise the first
# write fails with EACCES. SHARE_HISTORY (set in zshrc) writes each command
# immediately and makes it visible across concurrent shells.
RUN mkdir -p /commandhistory \
    && touch /commandhistory/.zsh_history \
    && chown -R node:node /commandhistory

# Shell config lives in a sibling file so it can be edited without escaping
# shell quoting inside a Dockerfile RUN. See .devcontainer/zshrc.
COPY --chown=node:node zshrc /home/node/.zshrc

# pnpm 11.1.1 — standalone install script, pinned version, installed system-wide
# so the non-root devcontainer user (node) can use it. Does not use Corepack:
# pnpm docs flag an outdated signatures issue requiring Corepack to be updated
# before it can install pnpm, which is bootstrapping friction we don't want in a
# Dockerfile. The standalone script is the recommended Docker approach.
# The script auto-selects the correct glibc build; libatomic1 is installed above.
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
RUN mkdir -p "$PNPM_HOME" \
    && wget -qO- https://get.pnpm.io/install.sh \
       | SHELL="$(which bash)" PNPM_VERSION=11.1.1 bash - \
    && chmod -R a+rx "$PNPM_HOME"

# GitHub CLI 2.93.0 — installed from the official cli.github.com apt repository.
# The keyring fingerprint is verified against GitHub's published key before trusting it.
# To update: change the version in `apt-get install gh=<version>` and update the comment.
# Latest releases: https://github.com/cli/cli/releases
RUN mkdir -p -m 755 /etc/apt/keyrings \
    && wget -nv -O /etc/apt/keyrings/githubcli-archive-keyring.gpg \
       https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    && gpg --show-keys /etc/apt/keyrings/githubcli-archive-keyring.gpg 2>/dev/null \
       | grep -qF "2C6106201985B60E6C7AC87323F3D4EA75716059" \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
       > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends gh=2.93.0 \
    && rm -rf /var/lib/apt/lists/*

# act v0.2.88 — run GitHub Actions locally, installed via nektosact.com install script
# -b sets the install directory; version arg pins the release.
RUN curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/master/install.sh \
    | bash -s -- -b /usr/local/bin v0.2.88

# prek v0.4.3 — pre-commit hook manager, copied from the official distroless image
COPY --from=ghcr.io/j178/prek:v0.4.3@sha256:953593c93d253d44bad97b36b428c13edd074dc35de003ccbf3ff9a40c0c79b9 /prek /usr/local/bin/prek

WORKDIR /workspace
