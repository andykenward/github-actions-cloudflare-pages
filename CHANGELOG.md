# github-actions-cloudflare-pages

## 1.1.2

### Patch Changes

- [`ff5af80`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/ff5af80c1fca02633c244eb8fc3e765208d93140) Thanks [@andykenward](https://github.com/andykenward)! - chore(deps): bump @octokit/plugin-paginate-rest 9.1.2 to 9.1.5
  chore(deps): upgrade @unlike/github-actions-core 0.1.2 to 1.0.0
  chore(deps-dev): bump @octokit/graphql-schema 14.39.0 to 14.46.0

- [#174](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/174) [`f5b3e48`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/f5b3e4808f54b070ebe682561f6815103475867e) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump wrangler from 3.15.0 to 3.22.1

## 1.1.1

### Patch Changes

- [#139](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/139) [`8036be3`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/8036be3dfee4bf741fec80bbc2f8631f261a6f53) Thanks [@andykenward](https://github.com/andykenward)! - refactor usage of undici to use @types/node

- [#143](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/143) [`801be33`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/801be33d5cfd2ec2305542685a304b8abbe04907) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): upgrade @octokit/plugin-paginate-rest to 9.1.2

- [#142](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/142) [`4367350`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/4367350f471bab3298536bacbe7bbd0bc5876795) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump wrangler from 3.8.0 to 3.15.0

## 1.1.0

### Minor Changes

- [#112](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/112) [`9a13d39`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/9a13d399548d0c1f37b9590e88f58e581bcd54a9) Thanks [@andykenward](https://github.com/andykenward)! - Use GitHub Action NodeJS 20 instead of actions/setup-node

## 1.0.0

### Major Changes

- [#110](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/110) [`983d2fc`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/983d2fc638e97131bcbdbaa349bb1502740ed169) Thanks [@andykenward](https://github.com/andykenward)! - Node 20

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
