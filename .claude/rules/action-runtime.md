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
2. Concurrently: check the GitHub Environment exists, resolve the PR to comment on, and run `npx wrangler@<v> pages deploy <directory> --project-name … --branch … --commit-dirty=true --commit-hash <sha>` in `working-directory`, for at most 30 minutes (`WranglerTimeout`). If the environment check or the PR lookup fails, or the timeout passes, the deploy is interrupted and wrangler killed through the `AbortSignal` passed to `execFile`.
3. Poll the deployment whose id wrangler wrote to `WRANGLER_OUTPUT_FILE_PATH` — or, for an old `wrangler-version` that writes none, the newest one matching the commit hash — every 1s for up to 10 min and at most 1000 polls (`PollCountMax`), until stage `deploy` is `success` (`active` means it is still running) or any stage is `failure`/`canceled`/`skipped`.
4. Set outputs `id`, `url`, `environment`, `alias`, `wrangler` and the job summary. If the build ended `failure`/`canceled`/`skipped`, `createCloudflareDeployment` then fails with `CreateDeploymentError` (linking the Cloudflare build log, with `skip_reason` for a skip), so steps 5 and 6 don't run.
5. Post the PR comment, with wrangler's output in a code block unless `wrangler-comment-output` is `false`.
6. Create the GitHub Deployment (payload `{cloudflare: {id, accountId, projectName}, url, commentId}`) and a `SUCCESS` status with the dashboard log URL.

- **PR to comment on** (`src/common/github/comment.ts`): the `pr-number` input wins (parsed as a positive integer by `DeployInputs`, so an invalid value fails before wrangler runs). Otherwise `pull_request` → the payload's node id (no comment when `closed`); `workflow_dispatch` → the first open PR headed by the branch; `workflow_run` → the single `pull_requests[]` entry matching `head_branch` + `head_sha`; `push` → no comment. For `workflow_dispatch` and `workflow_run`, finding no PR (or several, for `workflow_run`) **fails the deploy** with `CommentError` — it doesn't just skip the comment.
- **Branch and sha** (`src/common/github/context.ts`): `workflow_run` uses the payload's `head_branch` / `head_sha`; other events use `GITHUB_HEAD_REF || GITHUB_REF_NAME` and `GITHUB_SHA`. The `branch` input overrides only Cloudflare's `--branch`.

## Delete (`src/delete/main.ts`)

1. List GitHub deployments for the context branch (plus optional `github-environment`), newest first, following at most `PageCountMax` (100) pages of `PAGE_SIZE` (100); skip the first `keep-latest`, then keep only the oldest `DELETE_COUNT_MAX` (500) with a warning.
2. Run `batchDelete` (`src/common/batch-delete.ts`) on each, 5 at a time (`DELETE_CONCURRENCY` in `main.ts`): decode the payload → Cloudflare `DELETE …?force=true` (error code `8000009` "not found" counts as success; any other `CloudflareApiError` fails the row) → one GraphQL request that sets status `INACTIVE`, then deletes the deployment and its PR comment. Mutation fields run in order and one error doesn't stop the next: a status error fails the row, later errors only warn and put the reason in the row's `warning` (shown in the summary's Error column). A response without `data`, or an error without a `path`, means GitHub ran none of them (a rate limit, or a request rejected as invalid) and fails the row too.
3. Write the job summary table. `batchDelete` returns failures as `success: false` rows rather than throwing; `run` then fails the step with `DeleteError` if any row failed.

- **Payload versions** (`src/common/github/deployment/payload.ts`): V2 embeds the Cloudflare account and project; legacy V1 (`cloudflareId`) falls back to the `cloudflare-account-id` / `cloudflare-project-name` inputs. Keep V1 decoding — old deployments still exist in users' repos.

## GitHub client

- Operations are typed by `@graphql-codegen/client-preset` (`graphql.config.ts`): one `TypedDocumentString` `…Document` per operation in `__generated__/gql/graphql.ts`, so `GitHubApi.request` checks variables and results at compile time. The schema, including preview features, is `schema/github/schema.graphql`.
- `request` fails with `GitHubApiError` on a non-2xx response and, by default, on a GraphQL `errors` array. Pass `options: {errorThrows: false}` to inspect `errors` yourself (as `batchDelete` and `checkEnvironment` do).
- The one REST exception — `GitHubRestApi.paginate` (`src/common/github/api/paginate.ts`, a plain `fetch` following `Link` headers) for listing deployments — is provided only by `DeleteLayer`, the one action that lists them. It stays REST because GraphQL's `deployments` has no branch filter and its `ref` is `null` once the branch is deleted. `getGitHubDeployments` decodes the list with the `GitHubDeployment` schema (`src/common/github/deployment/types.ts`) — add a field there to read it.

## Cloudflare

- `wranglerPagesDeploy` (`src/common/cloudflare/deployment/wrangler.ts`) runs `execFileAsync('npx', [...])`. Pass the API token and account id in the **child env only** — never assign them onto `process.env`.
- The same env points `WRANGLER_OUTPUT_FILE_PATH` into a scoped temp directory under `RUNNER_TEMP` (or `os.tmpdir()`), removed afterwards. Wrangler appends ND-JSON there; the `pages-deploy-detailed` entry carries the `deployment_id` to poll.
- Wrangler is external to the bundle and installed at runtime from the `wrangler-version` input, or the default in `src/common/inputs.ts`. `bin/sync-versions.ts` keeps that default equal to `devDependencies.wrangler`, the single source of truth (tests read it too). The script matches the constant by name (`WRANGLER_VERSION_DEFAULT`), so renaming it means updating the script's pattern in the same change; `pnpm run all` runs the script first and fails if it no longer matches.
- Status polling and deletion go through `CloudflareApi` (`src/common/cloudflare/api/client.ts`). `result(client => client.pagesDeploymentGetDeploymentInfo(accountId, projectName, id, WITH_RESPONSE))` returns the envelope's typed `result`; `success(…)` is for calls without one (DELETE) and succeeds with `void`.
- `client` is the generated `effect/http` client (`make` in `__generated__/cloudflare/pages.ts`), one method per operation, over `FetchHttpClient` (Node's `fetch`); interrupting the effect aborts the fetch, so there is no `signal` to pass. Every call passes `WITH_RESPONSE` (spread it beside `params`), which makes the client return `[body, response]` — the response is where a failure's URL comes from. The layer turns `HttpClient.TracerPropagationEnabled` off, or every request would carry `traceparent` / `b3` headers.
- The client is generated type-only: it casts the body, so `unwrap` / `unwrapSuccess` (`src/common/cloudflare/api/fetch-result.ts`, plain functions returning `Result`) check the `{success, result, errors}` envelope (`Envelope` schema in `src/common/cloudflare/types.ts`) and `operationFailure` maps what the client fails with.
- A failure is `CloudflareApiError` (`src/common/cloudflare/api/error.ts`) whose `reason` is `ApiErrors` (an envelope with `errors`, on any status; `.code` is the first error's), `HttpError` (a body that is no envelope, e.g. an HTML 5xx; `statusText` comes from Node's `STATUS_CODES`), `MissingResult` or `RequestError` (fetch rejected). Branch on `reason._tag` — never on the message — as delete does for `8000009`. Nothing is annotated until a caller reports the failure, so a tolerated error leaves no annotation.
- Cloudflare's real responses (checked live 2026-09-11) differ from its OpenAPI schema — trust them, in code and in mocks: an `ad_hoc` deployment has `source: null` (the schema requires it; `PATCHES` in `bin/codegen/cloudflare-pages.ts` makes the generated type nullable); `8000007` (project) and `8000009` (deployment) not-found come with HTTP 404, `10000` (token lacks the permission) with 403, and an invalid token with 400 / `9106`. DELETE returns 200 with a `result: null` envelope, never 204.
- `src/common/cloudflare/api/endpoints.ts` only builds the `dash.cloudflare.com` log URL.
- Don't hand-list a Cloudflare enum. Derive the union from the generated type (`DeploymentStatus` in `src/common/cloudflare/deployment/status.ts` comes from `PagesDeployment['latest_stage']['status']`) and check a map keyed by it with `satisfies Record<…, string>` (`BUILD_OUTCOMES` in `src/common/cloudflare/deployment/create.ts`), so a value Cloudflare adds on the next `codegen:cloudflare` fails the type-check instead of going unhandled. The generated types carry no wording — that stays ours.

## Add an action input

1. Add it to `action.yml` or `delete/action.yml`, and an `INPUT_KEY_*` to `input-keys.ts`. Name it subject-first, grouping by what it configures: `wrangler-version`, `wrangler-comment-output` (not `comment-wrangler-output`), `cloudflare-*`, `github-*`. `INPUT_KEYS_REQUIRED` means "stubbed in every test" (only `stubRequiredInputEnv()` reads it), not "required in action.yml" — e.g. `keep-latest`, stubbed as `'0'` via `TYPED_INPUT_VALUES`.
2. Add it to the `Config.all({...})` of `CommonInputs` (`src/common/inputs.ts` — only the two tokens, the inputs both actions use), `DeployInputs` (`src/deploy/inputs.ts`) or `DeleteInputs` (`src/delete/inputs.ts`). An input both actions read differently (`github-environment`: required by deploy, optional for delete) is declared in each. Use `input(KEY)` or `optionalInput(KEY)` from `src/common/config/provider.ts` (an empty string counts as missing, and `optionalInput` reads a whitespace-only one as absent). For an optional input with a default, write `optionalInput(KEY).pipe(Config.map(v => v ?? DEFAULT))` like `wranglerVersionConfig` — `input(KEY).pipe(Config.withDefault(DEFAULT))` misses a whitespace-only value, which `input`'s trim turns into `''`. Validate a typed input with `Config.schema(S, KEY)` (`keepLatest`: `Schema.Natural`; `pullRequestNumber`: a positive `Schema.Int`; `workingDirectory`: a `Schema.makeFilter` check; `wranglerCommentOutput`: `BooleanInput` from `provider.ts`, the spellings `getBooleanInput` accepts), never a throw inside `Config.map` — that is a defect, not the `Input '<key>' is invalid: …` failure. Use `Config.Redacted(KEY)` for secrets. Read it with `const {x} = yield* DeployInputs` — never `getInput`.
3. Test its default and override — see the testing rule for stubbing inputs.
4. Document it in the Inputs table of `README.md` or `delete/README.md`.

## Add a Cloudflare Pages endpoint

1. Add the operation to the whitelist in `bin/codegen/cloudflare-pages.ts`, then run `pnpm run codegen:cloudflare`: it prunes Cloudflare's OpenAPI schema to those operations and runs `@effect/openapi-generator` (`httpclient-type-only`) over it. Never hand-edit `__generated__/cloudflare/`. Whitelist only operations `src/` calls, and remove one when its last caller goes: each is a method of the generated client, so an unused one is dead code in `dist/`. The run fails on any generator warning, and on a schema the generator can't express — add an RFC 6902 operation to `PATCHES` in the script (applied with the generator's `OpenApiPatch.applyPatches`), not an edit to the output. `PATCHES` is also where the schema is corrected to match Cloudflare's real responses (listed above); a patch whose path has gone fails the run, which is the cue to delete it. Make a `$ref` nullable with `anyOf: [{$ref}, {type: 'null'}]` — the generator ignores `nullable` beside `allOf`.
2. Add a named alias in `src/common/cloudflare/types.ts` — like `PagesDeployment = Pages_deployment` — and import that. Generated objects are `readonly` and open (`& {[x: string]: Schema.Json}`), so a misspelt property reads as `Json` instead of failing the type-check.
3. Call it in an `Effect.fn`: `const cloudflare = yield* CloudflareApi`, then `yield* cloudflare.result(client => client.<operationId>(accountId, projectName, {params: {…}, ...WITH_RESPONSE}))` — or `success` for calls without a `result` (e.g. DELETE). The base URL and auth come from the layer; never set headers per call.
4. Mock it with `interceptCloudflare(path, response, status, method)` (`__tests__/helpers/api.ts`); put fixtures in `__generated__/responses/`.

## Generator approaches already tried

Skip these unless `@effect/openapi-generator` changes.

- **Other hooks** (4.0.0): `generate` provides its own `OpenApiTransformer` per format, so a custom one is never used; closing objects through `onEnter` (`additionalProperties: false`) turns every `allOf` response into `never`.
- **The schema-decoding `httpclient` format** (2026-10-03): rejected. Its generated `Schema`s fail on Cloudflare's real project and deployment responses ("Missing key" — the schema marks fields required that aren't sent), the module is ~40KB minified against ~5KB, and a new enum value would fail a deploy.
