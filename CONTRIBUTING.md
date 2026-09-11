# Contributing

Thanks for helping out! This covers setting up the repository, what a pull request needs, and how the vendored Effect source is kept current. User-facing docs live in [README.md](README.md) (deploy action) and [delete/README.md](delete/README.md) (delete action).

## Setup

The quickest route is the [dev container](.devcontainer/devcontainer.json): it provides Node, pnpm and [prek], then runs `pnpm install && prek install` for you.

To set up by hand, install the Node and pnpm versions from [package.json](package.json) (`engines` and `packageManager`), then run:

```sh
pnpm install # also patches TypeScript and oxlint with the Effect language service
prek install # formats and lints staged files on every commit
```

pnpm refuses package versions published less than 7 days ago (`minimumReleaseAge` in [pnpm-workspace.yaml](pnpm-workspace.yaml)), so a brand-new release failing to install is expected.

## Commands

| Command                        | What it does                                                                                              |
| ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `pnpm run all`                 | Every check: version sync, knip, codegen, type-check, format, lint, test and build                        |
| `pnpm run test` / `test:watch` | Run the tests once / in watch mode                                                                        |
| `pnpm run lint`                | Lint, including the Effect diagnostics                                                                    |
| `pnpm run format`              | Format with oxfmt                                                                                         |
| `pnpm run build`               | Bundle the actions into `dist/`                                                                           |
| `pnpm run codegen`             | Regenerate the GraphQL types after editing a `.graphql` file                                              |
| `pnpm run start`               | Run the built deploy action locally, with inputs from a `.env` file based on [.env.example](.env.example) |
| `pnpm changeset`               | Describe your change for the changelog                                                                    |

## Pull requests

- **Run `pnpm run all` before pushing.** CI's test workflow only runs lint, type-check and tests, so knip, formatting and generated-code drift are yours to catch.
- **Commit `dist/`.** The action runs the committed bundle, and CI fails if it differs from a fresh `pnpm run build`.
- **Sign your commits.** Every branch requires [signed commits].
- **Record user-facing changes.** Add a changeset with `pnpm changeset`, and update [README.md](README.md) or [delete/README.md](delete/README.md) when an input, output or behavior changes.
- **Don't hand-edit generated files** under `__generated__/` — regenerate them. The API response fixtures in `__generated__/responses/` are the exception.

## Vendored Effect source

The [Effect] source is vendored at `repos/effect/`, so the source, tests and docs of the exact library this action builds on are available offline — for reading, grepping and as reference material for AI agents. It is read-only: nothing in `src/` imports from `repos/`, and application code keeps importing the published `effect` package. Every tool in the repo is configured to ignore `repos/` — TypeScript, Vitest, oxfmt, oxlint, knip, prek, zizmor, CodeQL, Dependabot version updates, git diffs and the VS Code editor — so vendoring it does not slow down or pollute the build.

It is a plain snapshot of the Effect release tag matching the `effect` version in [package.json](package.json) — one ordinary commit per update, with no Effect history and no `git subtree` metadata, so its pull requests can be merged any way. When a change to `package.json` lands on `main`, the [sync-effect.yml](.github/workflows/sync-effect.yml) workflow compares that version with the one in `repos/effect/packages/effect/package.json` and, if they differ, opens a pull request that replaces the snapshot. To run it on demand, use **Actions → sync effect → Run workflow**. To update by hand, run this from the repository root with a clean working tree:

```sh
tag="effect@$(jq -r .dependencies.effect package.json)"
git fetch --no-tags https://github.com/Effect-TS/effect.git "refs/tags/$tag"
git rm -rq --ignore-unmatch repos/effect
git read-tree --prefix=repos/effect/ -u FETCH_HEAD
git commit -m "chore: sync repos/effect to $tag"
```

## AI agents

Instructions for coding agents live in [.claude/CLAUDE.md](.claude/CLAUDE.md), with topic-specific rules in [.claude/rules/](.claude/rules/). Update them when a convention changes.

## Related docs

- [Effect documentation](https://effect.website/docs)
- [TypeScript ESM Node](https://www.typescriptlang.org/docs/handbook/esm-node.html)

[Effect]: https://effect.website/
[prek]: https://prek.j178.dev
[signed commits]: https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification
