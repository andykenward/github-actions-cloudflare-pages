---
"github-actions-cloudflare-pages": minor
---

refactor: replace [@unlike/github-actions-core](https://www.npmjs.com/package/@unlike/github-actions-core) with [@actions/core](https://www.npmjs.com/package/@actions/core) . It increases the bundle size from 30.6kb to 600.5kb because of [actions/toolkit#1436](https://github.com/actions/toolkit/issues/1436) & [actions/toolkit#1697](https://github.com/actions/toolkit/issues/1697). But we no longer want to maintain the fork of that repo. Rather they fix these issues.
