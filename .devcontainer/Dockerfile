# Base image pinned by digest for reproducibility. Bumping the node version
# means updating both the tag and the digest (see `docker pull` output).
FROM node:24.18.0-bookworm-slim@sha256:b31e7a42fdf8b8aa5f5ed477c72d694301273f1069c5a2f71d53c6482e99a2fc

# System packages. Individual versions are not pinned — the digest-pinned base
# image plus Docker's layer cache provide reproducibility in practice.
#   - zsh + zsh-autosuggestions: interactive shell setup, configured via zshrc.
#   - chsh: make zsh the login shell for the `node` user so VS Code terminals
#     and any `docker exec` sessions land in zsh by default.
#   - openssh-client: provides ssh-keygen, which git invokes to SSH-sign commits
#     (gpg.format=ssh + commit.gpgsign=true); without it commits fail.
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl wget gnupg ca-certificates apt-transport-https \
    git openssh-client bash zsh zsh-autosuggestions \
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

# pnpm 11.1.1 — installed globally from the npm registry rather than piping the
# get.pnpm.io install script to bash. npm resolves the package against its
# registry integrity hashes, so there is no unpinnable remote shell script
# executing as root at build time. npm's global prefix on the node image is
# /usr/local, so the binary lands on PATH for the non-root `node` user. Not
# Corepack: pnpm docs flag an outdated-signatures issue that adds bootstrapping
# friction; a plain npm global install sidesteps that. PNPM_HOME is where pnpm
# places its own globally-installed tools (`pnpm add -g`).
ENV PNPM_HOME="/usr/local/share/pnpm"
ENV PATH="$PNPM_HOME:$PNPM_HOME/bin:$PATH"
RUN npm install -g pnpm@11.9.0

# GitHub CLI 2.95.0 — installed from the official cli.github.com apt repository.
# The keyring is downloaded to a temp file and verified against GitHub's published
# PGP key fingerprints before being written to the system keyring path.
# GitHub publishes two active fingerprints; either one is accepted.
# To update: change the version in `apt-get install gh=<version>` and update the comment.
# Latest releases: https://github.com/cli/cli/releases
RUN mkdir -p -m 755 /etc/apt/keyrings \
    && out=$(mktemp) \
    && wget -nv -O "$out" https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    && gpg --show-keys "$out" 2>/dev/null \
       | grep -qE "2C6106201985B60E6C7AC87323F3D4EA75716059|7F38BBB59D064DBCB3D84D725612B36462313325" \
    && cat "$out" > /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
       > /etc/apt/sources.list.d/github-cli.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends gh=2.95.0 \
    && rm -rf /var/lib/apt/lists/*

# act v0.2.88 — run GitHub Actions locally, installed via the nektos/act install
# script. The installer is pulled from the matching version tag (not `master`) so
# the script that runs at build time is pinned alongside the binary it installs.
# The script verifies the downloaded release against its published checksums
# internally. -b sets the install directory; the version arg pins the release.
RUN curl --proto '=https' --tlsv1.2 -sSf https://raw.githubusercontent.com/nektos/act/v0.2.88/install.sh \
    | bash -s -- -b /usr/local/bin v0.2.88

# prek v0.4.3 — pre-commit hook manager, copied from the official distroless image
COPY --from=ghcr.io/j178/prek:v0.4.3@sha256:953593c93d253d44bad97b36b428c13edd074dc35de003ccbf3ff9a40c0c79b9 /prek /usr/local/bin/prek

# Drop to the non-root `node` user as the image default. devcontainer.json sets
# `remoteUser: node` for VS Code sessions, but this also covers plain
# `docker exec`/`docker run`, so nothing lands as root by default. All privileged
# install steps above run as root; devcontainer features re-elevate on their own.
USER node

WORKDIR /workspace
