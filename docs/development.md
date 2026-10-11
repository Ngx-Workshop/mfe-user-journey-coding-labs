# Development and verification

Use Node 22 and the committed lockfile. Preserve Angular/Material 21.1 compatibility with the shell.

| Purpose | Command |
| --- | --- |
| Install | npm ci |
| Architecture | npm run check:architecture |
| Dev server | npm start |
| Local bundle watcher | npm run dev:bundle |
| Production federation build | npm run build |
| Isolated verification build | npm run build -- --output-path dist/learner-verification |
| Behavior tests | npm test -- --watch=false --browsers=ChromeHeadless |
| Source types | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json |

Existing local servers should keep their port/output; use the isolated build during verification. Tests use HTTP doubles. Source has no browser execution fallback or synthetic production catalog.

## Live integration

Deploy service-coding-labs before service-user-metadata, set metadata CODING_LABS_BASE_URL to the coding service base (without /published-labs), and forward platform authentication. Gateway must forward /api/coding-labs/* and /api/user-metadata/* with the existing prefix conventions. The new metadata collection is coding_lab_attempts, with unique per-user request IDs and a partial unique active attempt per user/lab. Ensure its indexes exist before serving concurrent starts.

For direct local tests override the two API injection tokens or provide a local gateway. Browser auth and host providers remain host-owned. Do not relax authentication to get a screenshot. The beta URL redirected the verification browser to sign-in; local browser tests used a disposable Mongo database, real Docker grading, and a controlled test identity.

## Verification evidence

[002 handoff](../specs/002-learner-journey/handoff.md) records test/build results and integration scope. Validate catalog, saved-code reload, passing/failing results, historical views, retry, keyboard access and narrow layouts. To regenerate snapshots: run producers' build/OpenAPI and contract generation commands, then copy their generated components/paths types into models/*.contract.ts. Publish fresh contract versions in a separate release before switching to package imports.
