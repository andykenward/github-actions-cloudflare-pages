# GitHub Actions Cloudflare Pages - AI Agent Instructions

## Project Overview

Dual-mode GitHub Action for Cloudflare Pages deployments: `deploy` creates deployments via Wrangler CLI and links them to GitHub Deployments/Environments, `delete` batch-removes old deployments. Built with TypeScript ESM, GraphQL-typed GitHub API integration, and comprehensive vitest testing.

**See [HOOKS.md](.github/HOOKS.md) for agent hook setup, behavior, and sync requirements.**

## Architecture

### Dual Entry Points

- **Deploy**: [src/deploy/index.ts](src/deploy/index.ts) → bundled to [dist/deploy/index.js](dist/deploy/index.js) → consumed by [action.yml](action.yml)
- **Delete**: [src/delete/index.ts](src/delete/index.ts) → bundled to [dist/delete/index.js](dist/delete/index.js) → consumed by [delete/action.yml](delete/action.yml)
- **Shared Logic**: [src/common/](src/common/) contains reusable code for both actions (GitHub API, Cloudflare deployment logic, batch operations)

### Path Aliases (`@/` prefix)

All imports use [tsconfig.json](tsconfig.json) path mappings (`@/common/*`, `@/deploy/*`, `@/gql/*`, etc.). **Critical**: Keep [tsconfig.json](tsconfig.json) paths in sync with [vitest.config.ts](vitest.config.ts) `resolve.alias` - vi.mock() fails otherwise.

### GraphQL Type Safety

- GitHub GraphQL API queries/mutations in `src/**/` are type-safe via [@graphql-codegen/client-preset](graphql.config.ts)
- Run `pnpm run codegen` to regenerate [**generated**/gql/](__generated__/gql/) types from inline `graphql()` calls
- Uses fragments pattern (see [src/common/github/fragments.ts](src/common/github/fragments.ts))
- Custom client: [src/common/github/api/client.ts](src/common/github/api/client.ts) wraps fetch with TypedDocumentString for compile-time validation
- Preview features added via [schema/github-preview/schema.graphql](schema/github-preview/schema.graphql)

### Cloudflare Integration

- Executes `wrangler pages deploy` via `execAsync()` (see [src/common/cloudflare/deployment/create.ts](src/common/cloudflare/deployment/create.ts#L47-L56))
- Wrangler is external dependency (not bundled) - defined in [esbuild.config.js](esbuild.config.js#L20)
- Uses REST API for deployment status polling and deletion

### Code Generation

Two codegen workflows:

1. **GraphQL**: `pnpm run codegen` → generates [**generated**/gql/](__generated__/gql/) from inline queries
2. **GitHub Event Types**: `pnpm run codegen:events` → runs [bin/codegen/index.ts](bin/codegen/index.ts) to generate workflow event types from `@octokit/webhooks-schemas`

## Development Workflows

### Essential Commands

```bash
pnpm run all           # Full validation: knip → codegen → tsc → format → lint → test → build
pnpm run build         # ESBuild bundle to dist/deploy & dist/delete
pnpm run test          # Vitest run
pnpm run test:watch    # Interactive test mode
pnpm run codegen:watch # Auto-regenerate types on GraphQL changes
pnpm run act:d         # Test delete action locally with act
```

### Build Requirements

- **Node 24**: Strict engine requirement in [package.json](package.json#L102)
- **pnpm 10.15.1**: Enforced by `packageManager` field
- **TypeScript Script Execution**: In this repo environment, Node.js can run `.ts` scripts directly without extra runner commands. Prefer `node path/to/script.ts` for one-off script execution (for example, `node bin/sync-versions.ts`).
- After modifying GraphQL queries/mutations: `pnpm run codegen` before building
- After changing input keys in [action.yml](action.yml): Update [input-keys.ts](input-keys.ts)

### Debugging

- ESBuild sourcemaps enabled ([esbuild.config.js](esbuild.config.js#L11))
- Use `pnpm run start` to test built action locally (requires local env vars)
- Vitest debug mode: Add `debugger` statements and run with Node inspector

## Testing Patterns

### Setup & Mocking

- **Global Setup**: [vitest.setup.ts](vitest.setup.ts) stubs all required env vars and input env vars before each test
- **Core Mocking**: [**mocks**/@actions/core.ts](__mocks__/@actions/core.ts) provides vi.fn() wrappers for all @actions/core methods
- **HTTP Mocking**: Use undici MockAgent pattern (see [**tests**/helpers/api.ts](__tests__/helpers/api.ts))

### Test Helpers

- `stubTestEnvVars()`: Injects GitHub context env vars (see [**tests**/helpers/env.ts](__tests__/helpers/env.ts))
- `stubRequiredInputEnv()`: Sets all required action inputs to mock values (see [**tests**/helpers/inputs.ts](__tests__/helpers/inputs.ts))
- Real webhook payloads: [**generated**/payloads/](__generated__/payloads/) imported as json modules
- API responses: [**generated**/responses/](__generated__/responses/) for consistent test fixtures

### Module Mocking

```typescript
vi.mock(import('@actions/core')) // Auto-loads __mocks__/@actions/core.ts
vi.mock(import('@/common/utils.js')) // Mocks specific module
```

Always import using path aliases to match vitest.config.ts aliases.

### Writing Tests

- Use `describe(functionName)` with actual function reference for IDE navigation
- Assert `mockApi.mockAgent.assertNoPendingInterceptors()` to catch missed HTTP calls

## Project-Specific Conventions

### Input Key Management

All action inputs centralized in [input-keys.ts](input-keys.ts). When adding inputs:

1. Add constant `INPUT_KEY_*`
2. Update `INPUT_KEYS_REQUIRED` if mandatory
3. Update corresponding [action.yml](action.yml) or [delete/action.yml](delete/action.yml)
4. Add to test stub in [**tests**/helpers/inputs.ts](__tests__/helpers/inputs.ts)

### Error Handling

Use `raise()` utility for inline errors with type narrowing:

```typescript
const {name} = (await checkEnvironment()) ?? raise('Environment required')
```

See implementation in [src/common/utils.ts](src/common/utils.ts).

### GraphQL Operations

- Prefix mutations: `MutationCreateGitHubDeployment`
- Prefix fragments: `EnvironmentFragment`
- Place in same file as usage or in [src/common/github/fragments.ts](src/common/github/fragments.ts) if shared
- Always use `graphql(/* GraphQL */ `...`)` template tag for codegen detection

### Code Quality

- **Knip**: Dead code detection ([knip.json](knip.json)) - ignores [**generated**/](__generated__/), fragments, wrangler, act
- **Oxlint**: TypeScript linting with custom rules ([.oxlintrc.json](.oxlintrc.json))
- **TypeScript**: Strict mode with `verbatimModuleSyntax`, `noEmit`, `checkJs`
- **No console.log**: Use `@actions/core` methods (`info`, `debug`, `warning`, `error`, `setFailed`)
- **Documentation on Session Start**: [.github/hooks/session-start-docs.json](.github/hooks/session-start-docs.json) injects a list of available markdown files at the beginning of each agent session, helping you understand what guidance is available.
- **Hook Sync Rule**: When changing formatter/linter hook behavior or script paths, update these together: [.pre-commit-config.yaml](.pre-commit-config.yaml), [.github/hooks/format-and-lint-after-edit.json](.github/hooks/format-and-lint-after-edit.json), and the usage header in [.github/hooks/scripts/pre-commit-oxc.sh](.github/hooks/scripts/pre-commit-oxc.sh).
- **Type Check on Session End**: [.github/hooks/type-check-at-stop.json](.github/hooks/type-check-at-stop.json) runs `pnpm run tsc:check` when the agent finishes and blocks the session if type errors are found, forcing resolution before the session ends.

### File Organization

- [src/common/](src/common/): Shared between deploy/delete actions
- [src/common/github/](src/common/github/): GitHub API interactions (deployments, comments, environments)
- [src/common/cloudflare/](src/common/cloudflare/): Cloudflare Pages API and deployment logic
- [**generated**/](__generated__/): Never edit manually - regenerated by codegen scripts
- [**fixtures**/](__fixtures__/): Test data that's manually maintained
- [**tests**/](__tests__/): Mirrors src/ structure with `.test.ts` suffix

### ESBuild Specifics

- Banner adds `createRequire` shim for dynamic require compatibility ([esbuild.config.js](esbuild.config.js#L24-L35))
- External: `wrangler` (peer dependency expected in user's environment)
- Minification: Syntax and whitespace only (not identifiers) for debugging

## GitHub Actions Integration

- Requires manual creation of GitHub Environments (action cannot create due to permission requirements)
- Uses `GITHUB_TOKEN` with permissions: `actions:read`, `contents:read`, `deployments:write`, `pull-requests:write`
- Supports `push`, `pull_request`, `workflow_dispatch` events only (validated in [src/deploy/main.ts](src/deploy/main.ts#L19-L27))
- Deployment payload includes Cloudflare metadata for deletion workflow ([src/common/github/deployment/types.ts](src/common/github/deployment/types.ts))

## When Modifying Core Functionality

1. **Adding GitHub API Operations**: Create GraphQL operation in appropriate file → run `pnpm run codegen` → use typed `request()` client
2. **New Action Inputs**: Update action.yml → add key to input-keys.ts → handle in inputs.ts → stub in test helpers
3. **Cloudflare API Changes**: Update types in [src/common/cloudflare/types.ts](src/common/cloudflare/types.ts) → add fixtures to [**generated**/responses/](__generated__/responses/)
4. **Breaking Changes**: Document in [CHANGELOG.md](CHANGELOG.md) using changesets: `pnpm changeset`

## Additional Resources for AI Agents

- **[HOOKS.md](.github/HOOKS.md)** — **Essential reading** for understanding the three-hook ecosystem (formatter/linter automation, type-check enforcement, and pre-commit integration). Must consult this when working with hook behavior or paths.
- **[README.md](README.md)** — User-facing documentation for the action.
- **[CHANGELOG.md](CHANGELOG.md)** — Record of changes and breaking changes for this project.
