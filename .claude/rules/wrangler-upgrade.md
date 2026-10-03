---
paths:
  - '__generated__/types/cloudflare/**'
  - 'src/common/inputs.ts'
  - 'src/common/cloudflare/deployment/wrangler.ts'
  - 'bin/sync-versions.ts'
---

# Review a wrangler upgrade

Whenever `devDependencies.wrangler` changes (a Dependabot cloudflare-group PR or a manual bump), look for improvements the new version allows — don't only make CI green. Do it in this order, and report the findings to the user before changing `src/`. `<old>` and `<new>` below are the two versions.

1. **Regenerate.** Check out the bump's branch, `pnpm install`, then `pnpm run all`: it syncs `WRANGLER_VERSION_DEFAULT`, refreshes `__generated__/types/cloudflare/pages.ts` and rebuilds `dist/`. Commit that to the bump's branch; the checks fail without it.
2. **Read the release notes for every version in the range** — after `<old>`, up to and including `<new>`. The list is newest first and covers every package, so save it once and cut it:

   ```sh
   gh api repos/cloudflare/workers-sdk/releases --paginate \
     --jq '.[] | select(.tag_name | startswith("wrangler@")) | "## \(.tag_name)\n\(.body)"' > notes.md
   awk '/^## wrangler@<new>$/{keep=1} /^## wrangler@<old>$/{exit} keep' notes.md > range.md
   ```

   Under about ten releases, read `range.md` in full. Otherwise search it case-insensitively for `pages`, `WRANGLER_OUTPUT_FILE`, `CLOUDFLARE_`, `API token`, `deprecat`, `retry`, `Node`, `security`, `GHSA` and `undici`. Most entries are Workers-only and don't apply; a security fix in a bundled dependency does, as a reason to take the bump promptly.

3. **Check the Pages types.** They come from Cloudflare's OpenAPI schema (`cloudflare/api-schemas`), not from wrangler, so `git diff origin/main -- __generated__/types/cloudflare/` shows API drift since the last regeneration and is often empty. Reworded descriptions are noise. Diff or not, confirm every value of the enums the action branches on is handled: `latest_stage.status` and `name` (`pollOnce` in `src/common/cloudflare/deployment/status.ts` treats an unknown status as still pending, so an unhandled terminal status polls to the 10-minute timeout), `skip_reason`, `environment`. Note any new field on `pages_deployment` worth an output or a summary row.
4. **Compare the two versions**, because the release notes omit detail. Read; never execute a downloaded package.
   - **Source first** — readable TypeScript, fetched from GitHub at the release tags (wrangler's source isn't vendored: the action never imports it, and a single snapshot can't show a difference). List the commits that touched the Pages code in the range, then diff the deploy command itself:

     ```sh
     since=$(gh api "repos/cloudflare/workers-sdk/releases/tags/wrangler@<old>" --jq .published_at)
     gh api "repos/cloudflare/workers-sdk/commits?sha=wrangler@<new>&path=packages/wrangler/src/pages&since=$since&per_page=100" \
       --jq '.[] | "\(.sha[0:7]) \(.commit.message | split("\n")[0])"'
     for version in <old> <new>; do
       gh api -H 'Accept: application/vnd.github.raw' \
         "repos/cloudflare/workers-sdk/contents/packages/wrangler/src/pages/deploy.ts?ref=wrangler@$version" > "deploy-$version.ts"
     done
     diff deploy-<old>.ts deploy-<new>.ts
     ```

     Write the files to a scratch directory outside the repo. `deploy.ts` holds the flags the action passes (`"project-name"`, `branch`, `"commit-hash"`, `"commit-dirty"` under `args:`; none may be gone, `hidden: true` or `deprecated:`) and the `pages-deploy-detailed` entry with its `deployment_id`. No commits and an empty diff settle both. Don't use the `compare/<old>...<new>` endpoint to look for Pages changes — it stops at 300 files and a normal range exceeds that.

   - **Then the bundles**, which are what `npx` actually runs and include code from sibling packages the path filter misses. In the same scratch directory, `npm pack wrangler@<old> wrangler@<new>`, extract each, and `diff` the two `package/wrangler-dist/cli.js`; search the diff for `pages`, `writeOutput`, `WRANGLER_OUTPUT` and `CLOUDFLARE_`. Confirm the output-file entry types are unchanged: `grep -A1 'writeOutput({' package/wrangler-dist/cli.js | grep -o 'type: "[a-z-]*"' | sort -u`.
   - **`engines.node`** in `package/package.json`. Wrangler runs through `npx` on the Node of the runner's `PATH`, not the action's `using: node24`, and the READMEs state no minimum — if it rose, tell the user and document it in `README.md`.
5. **Verify each idea against the new source and bundle before proposing it.** A release note can promise more than the code gives (see `command-failed` below).
6. **Report** each finding as: what changed upstream, what it means for the action, and a recommendation (do, optional, or doesn't apply and why), marked verified in the bundle or release-notes only. Say plainly when nothing applies. Each accepted improvement gets its own branch and PR, separate from the bump.

To rehearse this without a bump, skip step 1 and regenerate the types with `node bin/codegen/cloudflare-pages.ts && pnpm exec oxfmt --write __generated__/types/cloudflare/pages.ts` — `pnpm run codegen:cloudflare` formats the whole repo.

## Already checked

Skip these unless the behavior changes.

- **`command-failed` output-file entry** (4.116+; `code`, `message`, `retry_after_ms`) as the source for `WranglerError`: rejected 2026-10-03. For an API error its `message` is only `A request to the Cloudflare API (…) failed.`; the explanation is in wrangler's `notes`, which reach stderr alone. Reconsider only if the entry gains the notes.
- **Agent Pages-to-Workers delegation** (4.129+) never applies: `pages deploy --branch <name>` stays on Pages, and the action always passes `--branch`.
