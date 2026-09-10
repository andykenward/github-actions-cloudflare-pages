---
paths:
  - 'src/**/*.graphql'
  - 'bin/**/*.graphql'
  - 'graphql.config.ts'
  - '__generated__/gql/**'
---

# GraphQL operations

Operations live in `.graphql` files beside the module that uses them (`src/common/github/comment.graphql` next to `comment.ts`). Codegen (`@graphql-codegen/client-preset`, `graphql.config.ts`) scans only `src/**/*.graphql` and `bin/**/*.graphql`, and emits into `__generated__/gql/graphql.ts` one `…Document` constant per operation plus its `…Query`/`…Mutation` and `…Variables` types. A `graphql()` template in a `.ts` file is not picked up.

## After editing a `.graphql` file

1. **`pnpm run codegen`** — the `…Document` constant and its types don't exist, or are stale, until you do. Formatting before or after is safe: code imports documents by name, so re-indenting a `.graphql` file can't break types. Run codegen after `pnpm run format` so the generated text matches the source.
2. **Use it**: import the `…Document` from `@/gql/graphql.js` and call `yield* github.request({query: XDocument, variables})` (the `GitHubApi` service, `src/common/github/api/client.ts`). A `bin/` script run with plain `node` can't import runtime values from `@/gql/` — read the `.graphql` file at runtime and import only types (see `bin/download/payloads/github-webhooks-payload-examples.ts`).
3. **Update every test mock** for the operation: `grep -rn XDocument __tests__/`. `interceptGithub` matches the request body exactly, so mock variables in the same key order the code sends them.
4. `pnpm run tsc:check` and `pnpm run test`; `pnpm run build` when `src/` changed (`dist/` is committed).

## Writing operations

- **Name** each operation for what it does — `GetEnvironmentAndRef`, `GetOpenPullRequestByBranch`, `CreateGitHubDeployment`. No `Query`/`Mutation` prefix: codegen appends `Document`, `Query`, `Mutation`.
- **Mutations take one input object per field** — `createDeployment(input: $input)` with `$input: CreateDeploymentInput!` — so the generated input type checks the variables. Constant flags (`autoMerge: false`) are set in code.
- **Variables** for every dynamic value, in camelCase.
- **Select only what the code reads**; include `id` on an object you use.
- **Fragments** only for a selection shared by two or more operations; put shared ones in a `fragments.graphql`.
- **Several mutation fields in one operation** run in order, and an error in one doesn't stop the next. Check `errors[].path[0]` to tell which failed — see `src/common/github/deployment/delete.graphql` and `src/common/batch-delete.ts`.
- The schema is `schema/github/schema.graphql` (refreshed weekly). A scalar generated as `any` needs a mapping in `graphql.config.ts`. Never edit `__generated__/gql/`.
