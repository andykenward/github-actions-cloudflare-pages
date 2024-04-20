# github-actions-cloudflare-pages

## 2.1.0

### Minor Changes

- [`41d9f3c`](https://github.com/andykenward/github-actions-cloudflare-pages/commit/41d9f3ce5375090c0a75cd0c4ec8cc2b91ca5943) Thanks [@andykenward](https://github.com/andykenward)! - rename unlike-ltd to andykenward. Transfer of repo owner.

## 2.0.0

### Major Changes

- [#291](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/291) [`824753d`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/824753d77273786b4e4dc36ef92ee596d0025fd3) Thanks [@andykenward](https://github.com/andykenward)! - - **BREAKING CHANGES:** use the sub-action `unlike-ltd/github-actions-cloudflare-pages/delete` to delete deployments. The main action `unlike-ltd/github-actions-cloudflare-pages` no longer deletes any deployments.
  - **BREAKING CHANGES:** new payload format saved to the GitHub deployments to allow for the sub-action `unlike-ltd/github-actions-cloudflare-pages/delete` to work. To support the older payload the action inputs of `cloudflare-account-id` & `cloudflare_project_name` are required. If an older payload is found and the action inputs are missing, it will silently error and continue; but output in the job summary the deployment.

### Patch Changes

- [`c8b06d3`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/c8b06d3bbdbe571ff33fc9ad5cd716e0cb4fd657) Thanks [@andykenward](https://github.com/andykenward)! - chore(deps-dev): bump eslint dep

- [`fa7dc9d`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/fa7dc9df266d4fb4b3497100f856830c7965a50a) Thanks [@andykenward](https://github.com/andykenward)! - chore(deps-dev): bump @octokit packages

- [`9ac63c7`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/9ac63c77ce83eed3db12dbef20ab98c7a7708465) Thanks [@andykenward](https://github.com/andykenward)! - chore(deps): bump @unlike/github-actions-core from 1.1.1 to 1.1.2

- [`cd858e3`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/cd858e3b2a437604e7f7bbc17cd892e30df8f392) Thanks [@andykenward](https://github.com/andykenward)! - feat(deps): bump @unlike/github-actions-core from 1.0.0 to 1.1.1

- [#330](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/330) [`174129b`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/174129bd26a7667dd38e6186bd5e93d8a31340d5) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump wrangler from 3.37.0 to 3.51.2

- [`1660ebe`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/1660ebee8fe8faea03243e98070c1d2d663f3733) Thanks [@andykenward](https://github.com/andykenward)! - feat(deps): bump @octokit-next/core from 2.7.1 to 2.8.0

- [`09a25c6`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/09a25c6ee3c9cbfd91b93364e9afbb567fe3430f) Thanks [@andykenward](https://github.com/andykenward)! - feat(deps): upgrade @octokit/plugin-paginate-rest from 10.0.0 to 11.0.0

- [#331](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/331) [`a484fbd`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/a484fbd8db123e52ce63d4082c0dfe30b6ae6ed7) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump the octokit npm packages

## 1.3.2

### Patch Changes

- [#277](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/277) [`6a049b5`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/6a049b5e6d0d588443ef47cab80f662c6d6f99d8) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps-dev): bump @octokit/graphql-schema from 15.2.0 to 15.3.0
  chore(deps-dev): bump @octokit/webhooks-schemas from 7.3.2 to 7.4.0
  chore(deps-dev): bump @octokit/webhooks-types from 7.3.2 to 7.4.0

- [#281](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/281) [`3cb82ad`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/3cb82ad6d6ceb02c10e10471747847390ce6d3d9) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): bump wrangler from 3.32.0 to 3.37.0

- [#282](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/282) [`47de0c7`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/47de0c7017aaf3e6fd519b12a1c6ae2bc55ea458) Thanks [@andykenward](https://github.com/andykenward)! - feat: support input `working-directory` for `wrangler` cli command

## 1.3.1

### Patch Changes

- [#269](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/269) [`12ada06`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/12ada069b766d7129a6c92805c0394337ebcd331) Thanks [@andykenward](https://github.com/andykenward)! - feat: get GitHub deployments based on branch & environment

## 1.3.0

### Minor Changes

- [#256](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/256) [`eac850d`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/eac850d5ebd29a0f4152a1ab7d6a9d56cfb43a8a) Thanks [@andykenward](https://github.com/andykenward)! - feat: wrangler output shown in summary and PR comment

- [#252](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/252) [`4048f91`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/4048f91dba786d67c669738bbe6819dd35a429bd) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): Updates `wrangler` from 3.28.1 to 3.32.0

### Patch Changes

- [#255](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/255) [`21dce1a`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/21dce1a3e306226ff145f9a9998d096e5f44fad7) Thanks [@andykenward](https://github.com/andykenward)! - docs: permissions

- [#255](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/255) [`4627ef3`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/4627ef3085643829b237345e6a0f86daa6c668b9) Thanks [@andykenward](https://github.com/andykenward)! - feat: enable esbuild minifying

- [`75c03ec`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/75c03ec2a37dae5536cca1c13edf5deac0505a11) Thanks [@andykenward](https://github.com/andykenward)! - Error on unsupported GitHub Action event name

- [`fffd89b`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/fffd89b51399a3cfae646a2496604bc64510b75b) Thanks [@andykenward](https://github.com/andykenward)! - chore(deps-dev): bump @graphql-codegen/client-preset from 4.2.2 to 4.2.4

- [#248](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/248) [`7c79d45`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/7c79d459deae6df8d39e8dd842ff4f1d5c0d786e) Thanks [@dependabot](https://github.com/apps/dependabot)! - chore(deps): upgrade @octokit/plugin-paginate-rest from 9.1.5 to 10.0.0. Which is now [ESM](https://github.com/octokit/plugin-paginate-rest.js/pull/596) and we can tree shake.

  chore(deps-dev): bump @octokit/graphql-schema from 14.56.0 to 14.56.0

- [#255](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/255) [`19f26f7`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/19f26f7be493025857be5f7e816f4cd34823c551) Thanks [@andykenward](https://github.com/andykenward)! - feat: call setFailed for missing GitHub environments

- [#255](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/255) [`1814865`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/18148659a99d53bed9aed62d942d7dddcaa220ca) Thanks [@andykenward](https://github.com/andykenward)! - refactor: remove usage of barrel files

- [`3f3692c`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/3f3692c8409e8883cc98a94f45dce298343301c8) Thanks [@andykenward](https://github.com/andykenward)! - chore(deps-dev): upgrade @octokit/graphql-schema from 14.58.0 to 15.2.0

- [`091175e`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/091175e145a592703139c426e6c558b656fa04da) Thanks [@andykenward](https://github.com/andykenward)! - chore(deps-dev): bump esbuild from 0.20.0 to 0.20.1

- [#232](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/232) [`fcb1d78`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/fcb1d780fbb54c56bb32fb66cb6494a68dca573d) Thanks [@andykenward](https://github.com/andykenward)! - test: enable vitest reporter for github-action. Bump vitest from 1.3.0 to 1.3.1. Bump eslint-plugin-vitest from 0.3.22 to 0.3.24.

## 1.2.0

### Minor Changes

- [#223](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/223) [`e4ea179`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/e4ea17979d32e89b8713d272bc576b2fd27fa72b) Thanks [@andykenward](https://github.com/andykenward)! - Now polls the Cloudflare Pages API deployments endpoint every 1 second for the current status of the matching commit hash, if the status is not "idle" it will stop polling and continue the action. This fixes the issue #222 , where the PR comment would have the wrong preview URL.

  CLOSES #222

## 1.1.3

### Patch Changes

- [#216](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/216) [`88b82bc`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/88b82bcc14181e54262e91dcbed509a7489e5578) Thanks [@dependabot](https://github.com/apps/dependabot)! - Updates @octokit/graphql-schema from 14.46.0 to 14.55.1
  Updates @octokit/webhooks-schemas from 7.3.1 to 7.3.2
  Updates @octokit/webhooks-types from 7.3.1 to 7.3.2

- [#188](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/188) [`b6d3336`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/b6d333602ca07945ee7b2f912610f08442fc90a6) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump the cloudflare from 3.22.1 to 3.22.4

- [#218](https://github.com/unlike-ltd/github-actions-cloudflare-pages/pull/218) [`3e0e7d7`](https://github.com/unlike-ltd/github-actions-cloudflare-pages/commit/3e0e7d73d72e34001d635b51e638a25b9f72f4b7) Thanks [@dependabot](https://github.com/apps/dependabot)! - bump wrangler from 3.22.4 to 3.28.1

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
