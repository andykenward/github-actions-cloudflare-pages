# github-actions-cloudflare-pages

## 0.2.0

### Minor Changes

- [#86](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/86) [`f8d42fb`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/f8d42fb953c8240fdf3bb942cd50820514c864dc) Thanks [@andykenward](https://github.com/andykenward)! - replace execa with exec from node:child_process

### Patch Changes

- [`3acff2f`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/3acff2f8996c29d144709f6862b7c7691f8641e6) Thanks [@andykenward](https://github.com/andykenward)! - bump wrangler to 3.5.0

## 0.1.1

### Patch Changes

- e05143d: refactor: use wrangler version from package.json
- 7db8360: chore(deps): bump @unlike/github-actions-core to 0.1.2
- fc5ad34: chore(deps-dev): bump @octokit/graphql-schema to 14.24.1
- 8c166b8: refactor: file & function naming convention. Improved usage of getInput & env mocking
- 9fc3d98: chore(deps): bump wrangler to 3.4.0
- c3e5e3e: chore(deps): bump execa to 7.2.0

## 0.1.0

### Minor Changes

- e1dbbb5: feat: production branch delete old deployments but latest 5

### Patch Changes

- 232de83: fix: get github deployments using branch instead of ref
- 77913d1: chore(deps-dev): bump @octokit-next/core to 2.7.1
- 1eea162: custom GitHub preview schema for types
- 23e11ac: feat: catch cloudflare manual deployment deletions so we delete github deployments

## 0.0.1

### Patch Changes

- 6984818: Add comment to pull request detailing the cloudflare pages deployment
- 50b305a: use node 18 along with built-in fetch
- 2e4d4d0: Use GitHub Environments & Deployments to sync with Cloudflare pages deployments
- 9e802bb: feat: add payload to github deployment that contains infomation to delete
- 52f8385: refactor: github action input keys
- 4d8f9b8: docs
