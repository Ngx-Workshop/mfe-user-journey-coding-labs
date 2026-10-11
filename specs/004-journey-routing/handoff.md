# Handoff: Route-driven learner journey
Status: Implemented; hosted integration pending · 2026-10-11
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior
Empty entry redirects to explore. Angular route data and attemptId path parameters select explore, history, workspace and results. Existing hello-world query links migrate to canonical paths while retaining workshop context. Unknown local paths recover to explore. Completed attempts normalize to results; unfinished result links normalize to workspace; standalone submission replaces the editor URL with results. Workshop completion still returns to the validated lesson destination.

Standalone bootstrap now renders RouterOutlet so the same exported Routes drive both standalone and federated entry. App/Routes exports, federation exposures, Angular versions and HTTP/scoring contracts remain intact. Loading/error remain on the requested page. Unsaved-code confirmation covers page exits, browser Back and reused-route parameter changes; active writes block exits. Approved button navigation confirms once. Same-page query refresh retains drafts; approved exits to a different page discard unsaved edits.

## Acceptance and verification
- AC-001–004: 34 ChromeHeadless tests pass, including eight RouterTestingHarness tests under /coding-labs with HTTP/Location doubles. Cover default/history/unknown entry, legacy context, canonical results/workspace, dirty exits and parameter changes, browser Back, busy writes, standalone submit, direct workshop launch and missing-attempt error recovery. Existing store/command/workshop tests also pass.
- Architecture: npm run check:architecture passed.
- Source types/unused checks: npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json passed.
- Production federation build: npm run build -- --output-path /tmp/mfe-user-journey-coding-labs-routing-build passed.
- git diff --check passed.

The first router test run exposed duplicate initial detail reads; settled snapshots are now deduplicated before refresh orchestration. Back navigation tests explicitly install the router location listener because TestBed does not perform application bootstrap. These checks do not claim signed-in hosted integration.

## Consumer handoff and remaining work
X001: Shell owner should mount the exported Routes beneath its existing coding-labs prefix, then verify signed-in direct links, browser reload, Back and workshop return after deployment. New links should target /coding-labs/explore and path-based attempt/result states. Legacy hello-world links remain compatible. Consumers using ./Component directly must supply equivalent route data and attemptId parameters. No deployment, remote registration or external repository changes were performed.

Updated README, architecture/development guides, seed adoption and feature index. Historical specs remain as provenance; this feature supersedes their hello-world preservation decisions. No local implementation work remains.
