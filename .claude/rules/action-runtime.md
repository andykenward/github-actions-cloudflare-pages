---
paths:
  - 'src/**'
  - 'action.yml'
  - 'delete/action.yml'
  - 'input-keys.ts'
  - 'bin/codegen/cloudflare-pages.ts'
---

# Action runtime

## Deploy (`src/deploy/main.ts`)

1. Read inputs. When the `GitHubContext` layer is built, `GITHUB_EVENT_NAME` is checked against the generated `EVENT_NAMES` and the `GITHUB_EVENT_PATH` file is decoded with the `WorkflowEvent` schema (`src/common/github/workflow-event/types.ts`) — only the fields the action reads, per event, so a payload missing one fails there naming it. Reading a new payload field means adding it to that schema. `main.ts` then checks the supported set: `push`, `pull_request`, `workflow_dispatch`, `workflow_run`.
2. Concurrently: check the GitHub Environment exists, resolve the PR to comment on, and run `npx wrangler@<v> pages deploy <directory> --project-name … --branch … --commit-dirty=true --commit-hash <sha>` in `working-directory`. If the environment check or the PR lookup fails, the deploy is interrupted and wrangler killed through the `AbortSignal` passed to `execFile`.
3. Poll the deployment whose id wrangler wrote to `WRANGLER_OUTPUT_FILE_PATH` — or, for an old `wrangler-version` that writes none, the newest one matching the commit hash — every 1s for up to 10 min, until stage `deploy` is `success` (`active` means it is still running) or any stage is `failure`/`canceled`.
4. Set outputs `id`, `url`, `environment`, `alias`, `wrangler` and the job summary. If the build ended `failure`/`canceled`, `createCloudflareDeployment` then fails with `CreateDeploymentError` (linking the Cloudflare build log), so steps 5 and 6 don't run.
5. Post the PR comment.
6. Create the GitHub Deployment (payload `{cloudflare: {id, accountId, projectName}, url, commentId}`) and a `SUCCESS` status with the dashboard log URL.

- **PR to comment on** (`src/common/github/comment.ts`): the `pr-number` input wins (parsed as a positive integer by `DeployInputs`, so an invalid value fails before wrangler runs). Otherwise `pull_request` → the payload's node id (no comment when `closed`); `workflow_dispatch` → the first open PR headed by the branch; `workflow_run` → the single `pull_requests[]` entry matching `head_branch` + `head_sha`; `push` → no comment. For `workflow_dispatch` and `workflow_run`, finding no PR (or several, for `workflow_run`) **fails the deploy** with `CommentError` — it doesn't just skip the comment.
- **Branch and sha** (`src/common/github/context.ts`): `workflow_run` uses the payload's `head_branch` / `head_sha`; other events use `GITHUB_HEAD_REF || GITHUB_REF_NAME` and `GITHUB_SHA`. The `branch` input overrides only Cloudflare's `--branch`.

## Delete (`src/delete/main.ts`)

1. List GitHub deployments for the context branch (plus optional `github-environment`), newest first; skip the first `keep-latest`.
2. Run `batchDelete` (`src/common/batch-delete.ts`) on each, 5 at a time (`DELETE_CONCURRENCY` in `main.ts`): decode the payload → Cloudflare `DELETE …?force=true` (error code `8000009` "not found" counts as success) → one GraphQL request that sets status `INACTIVE`, then deletes the deployment and its PR comment. Mutation fields run in order and one error doesn't stop the next: a status error fails the row, later errors only warn. A response without `data`, or an error without a `path`, means GitHub ran none of them (a rate limit, or a request rejected as invalid) and fails the row too.
3. Write the job summary table. `batchDelete` returns failures as `success: false` rows rather than throwing; `run` then fails the step with `DeleteError` if any row failed.

- **Payload versions** (`src/common/github/deployment/payload.ts`): V2 embeds the Cloudflare account and project; legacy V1 (`cloudflareId`) falls back to the `cloudflare-account-id` / `cloudflare-project-name` inputs. Keep V1 decoding — old deployments still exist in users' repos.

## GitHub client

- Operations are typed by `@graphql-codegen/client-preset` (`graphql.config.ts`): one `TypedDocumentString` `…Document` per operation in `__generated__/gql/graphql.ts`, so `GitHubApi.request` checks variables and results at compile time. The schema, including preview features, is `schema/github/schema.graphql`.
- `request` fails with `GitHubApiError` on a non-2xx response and, by default, on a GraphQL `errors` array. Pass `options: {errorThrows: false}` to inspect `errors` yourself (as `batchDelete` and `checkEnvironment` do).
- The one REST exception — `GitHubRestApi.paginate` (`src/common/github/api/paginate.ts`, a plain `fetch` following `Link` headers) for listing deployments — is provided only by `DeleteLayer`, the one action that lists them. It stays REST because GraphQL's `deployments` has no branch filter and its `ref` is `null` once the branch is deleted. `getGitHubDeployments` decodes the list with the `GitHubDeployment` schema (`src/common/github/deployment/types.ts`) — add a field there to read it.

## Cloudflare

- `wranglerPagesDeploy` (`src/common/cloudflare/deployment/wrangler.ts`) runs `execFileAsync('npx', [...])`. Pass the API token and account id in the **child env only** — never assign them onto `process.env`.
- The same env points `WRANGLER_OUTPUT_FILE_PATH` into a scoped temp directory under `RUNNER_TEMP` (or `os.tmpdir()`), removed afterwards. Wrangler appends ND-JSON there; the `pages-deploy-detailed` entry carries the `deployment_id` to poll.
- Wrangler is external to the bundle and installed at runtime from the `wrangler-version` input, or the default in `src/common/inputs.ts`. `bin/sync-versions.ts` keeps that default equal to `devDependencies.wrangler`, the single source of truth (tests read it too).
- Status polling and deletion go through `CloudflareApi` (`src/common/cloudflare/api/client.ts`). `result((client, signal) => client.GET(…, {signal}))` returns the envelope's typed `result`; `success(…)` is for calls without one (DELETE) and succeeds with `void`. Pass the `signal` into every call so an interrupt or timeout aborts the fetch. Both make one openapi-fetch call and unwrap the `{success, result, errors}` envelope (`Envelope` schema in `src/common/cloudflare/types.ts`) with `unwrap` / `unwrapSuccess` (`src/common/cloudflare/api/fetch-result.ts`, plain functions returning `Result`). A failure is `CloudflareApiError` (`src/common/cloudflare/api/error.ts`) whose `reason` is `ApiErrors` (an envelope with `errors`; `.code` is the first error's), `HttpError` (non-2xx without an envelope, e.g. an HTML 5xx), `MissingResult` or `RequestError` (fetch rejected). Branch on `reason._tag` — never on the message — as delete does for `8000009`. Nothing is annotated until a caller reports the failure, so a tolerated error leaves no annotation.
- `src/common/cloudflare/api/endpoints.ts` only builds the `dash.cloudflare.com` log URL.

## Add an action input

1. Add it to `action.yml` or `delete/action.yml`, and an `INPUT_KEY_*` to `input-keys.ts`. `INPUT_KEYS_REQUIRED` means "stubbed in every test" (only `stubRequiredInputEnv()` reads it), not "required in action.yml" — e.g. `keep-latest`, stubbed as `'0'` via `TYPED_INPUT_VALUES`.
2. Add it to the `Config.all({...})` of `CommonInputs` (`src/common/inputs.ts` — only the two tokens, the inputs both actions use), `DeployInputs` (`src/deploy/inputs.ts`) or `DeleteInputs` (`src/delete/inputs.ts`). An input both actions read differently (`github-environment`: required by deploy, optional for delete) is declared in each. Use `input(KEY)` or `optionalInput(KEY)` from `src/common/config/provider.ts` (an empty string counts as missing, and `optionalInput` reads a whitespace-only one as absent). For an optional input with a default, write `optionalInput(KEY).pipe(Config.map(v => v ?? DEFAULT))` like `wranglerVersionConfig` — `input(KEY).pipe(Config.withDefault(DEFAULT))` misses a whitespace-only value, which `input`'s trim turns into `''`. Validate a typed input with `Config.schema(S, KEY)` (`keepLatest`: `Schema.Natural`; `prNumber`: a positive `Schema.Int`; `workingDirectory`: a `Schema.makeFilter` check), never a throw inside `Config.map` — that is a defect, not the `Input '<key>' is invalid: …` failure. Use `Config.redacted(KEY)` for secrets. Read it with `const {x} = yield* DeployInputs` — never `getInput`.
3. Test its default and override — see the testing rule for stubbing inputs.
4. Document it in the Inputs table of `README.md` or `delete/README.md`.

## Add a Cloudflare Pages endpoint

1. Add the operation to the whitelist in `bin/codegen/cloudflare-pages.ts` (types come from Cloudflare's OpenAPI schema), then run `pnpm run codegen:cloudflare`. Never hand-edit `__generated__/types/cloudflare/`.
2. Add a named alias in `src/common/cloudflare/types.ts` — like `PagesDeployment = components['schemas']['pages_deployment']` — and import that.
3. Call it in an `Effect.fn`: `const cloudflare = yield* CloudflareApi`, then `yield* cloudflare.result(client => client.GET('/accounts/{account_id}/...', {params: {path, query}}))` — or `success` for calls without a `result` (e.g. DELETE). Auth comes from the layer's client middleware; never set headers per call.
4. Mock it with `interceptCloudflare(path, response, status, method)` (`__tests__/helpers/api.ts`); put fixtures in `__generated__/responses/`.
