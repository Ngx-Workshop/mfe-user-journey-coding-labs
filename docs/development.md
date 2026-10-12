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

## GitHub Actions

GitHub executes only workflows in [`.github/workflows`](../.github/workflows).
The active [deployment workflow](../.github/workflows/deploy.yml) deploys pushes
to `main` and supports manual dispatch on `main`. It installs dependencies,
checks architecture, builds the production bundle and copies assets to the
frontend host using the configured Actions secrets.

[`.ngx-workshop/workflows`](../.ngx-workshop/workflows) contains saved seed
examples, not active Actions workflows. Its deployment example already includes
the push trigger; its check workflow is not registered with GitHub. The workshop
CLI manages the active deployment file, so after running `ngx-workshop deploy .`,
verify that it has not replaced the push trigger with a manual-only configuration.

## Live integration

Deploy service-coding-labs before service-user-metadata, set metadata CODING_LABS_BASE_URL to the coding service base (without /published-labs), and forward platform authentication. Gateway must forward /api/coding-labs/* and /api/user-metadata/* with the existing prefix conventions. The new metadata collection is coding_lab_attempts, with unique per-user request IDs and a partial unique active attempt per user/lab. Ensure its indexes exist before serving concurrent starts.

For direct local tests override the two API injection tokens or provide a local gateway. Browser auth and host providers remain host-owned. Do not relax authentication to get a screenshot. The beta URL redirected the verification browser to sign-in; local browser tests used a disposable Mongo database, real Docker grading, and a controlled test identity.

## Verification evidence

[002 handoff](../specs/002-learner-journey/handoff.md) records test/build results and integration scope. Validate catalog, saved-code reload, passing/failing results, historical views, retry, keyboard access and narrow layouts. To regenerate snapshots: run producers' build/OpenAPI and contract generation commands, then copy their generated components/paths types into models/*.contract.ts. Publish fresh contract versions in a separate release before switching to package imports.

## Continuity verification — 2026-10-11

17 ChromeHeadless tests and an isolated optimized build passed for this checkout. Synthetic desktop (1366px) and phone (390px) browser previews had no page errors or horizontal overflow. See [handoff](../specs/003-workshop-continuity/handoff.md) for evidence and the pending signed-in shell walkthrough. Use `/workshops/overview` for workshop returns; earlier `hello-world` workshop examples are outdated. Standalone lab providers now register exported Routes; cross-remote return paths still require host routing.

## Route verification — 2026-10-11

[004 routing](../specs/004-journey-routing/handoff.md) adds Angular RouterTestingHarness coverage beneath a host prefix, including legacy redirects, workspace/result reconciliation, direct launch, unsaved exits and same-route parameter changes. Browser Back uses Location test doubles with the router location listener enabled; production bootstrap installs that listener through provideRouter. Hosted signed-in deep-link/refresh and workshop return still require deployment verification.


## Quality refactor verification — 2026-10-11

[005 handoff](../specs/005-code-quality-refactor/handoff.md) records 44 passing
ChromeHeadless tests, strict source types, architecture checks without size warnings
and the optimized isolated federation build. The suite now covers configured HTTP
paths/credentials/payloads, save/grade ordering and busy lifetime, refresh/detail
cancellation, scoped draft isolation and destroyed-scope command cleanup in addition
to existing route/continuity/command/rendering tests.

The signed-in beta discovery page was inspected as a baseline. The modified isolated
build was previewed at 1366×900 and 390×844 with no horizontal overflow; search and
history navigation worked. The static preview had no API gateway, so it exercised
honest error/empty states. Successful data/workspace/result flows were tested with
HTTP doubles; a signed-in host walkthrough of the new bundle remains a release
check. The temporary preview server was stopped; the existing server/output remained
untouched. Verification used the available Node 24.9.0; project guidance remains Node 22.

## Shared hero verification — 2026-10-12

The remote consumes `vendor/tmdjr-ngx-shared-headers-21.0.3.tgz`, matching workshop
and assessment consumers. Shared-library changes require a fresh producer archive
and consumer manifest/lockfile update; registry publication is separate release work.

46 ChromeHeadless tests, isolated production build, source types and architecture
checks pass. Focused composition/motion tests are in
`testing/app/features/coding-labs/components/journey/lab-hero.component.spec.ts`.
Desktop/phone optimized previews at 1366px/390px have no horizontal overflow, hide
artwork on phones and honor reduced motion. Both renders were visually reviewed;
static preview catalog calls showed expected errors because no gateway was supplied.
See [006 handoff](../specs/006-shared-hero/handoff.md).

The laboratory visual revision replaces circuits/terminal with rising background
bubbles and test-tube artwork. Its 2 focused hero tests, production build and
architecture checks pass; desktop/phone and reduced-motion renders were rechecked.
The preceding full-suite result belongs to initial shared-layout adoption.
