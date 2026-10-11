# Feature: Route-driven learner journey
Status: Implemented; hosted integration pending · 2026-10-11

## Problem and scope
The adopted journey still defaults to hello-world and selects pages through query parameters. Angular routes must own catalog, history, workspace and results. HTTP, scoring and federation exports remain compatible.

## Requirements and acceptance
- FR-001 / AC-001: Empty entry opens explore; history, attempts/:attemptId and results/:attemptId support direct links and reload under any host mount.
- FR-002 / AC-002: Start/resume opens workspace; completed attempts and successful standalone submissions open results; unfinished result links return to workspace. Preserve workshop query context.
- FR-003 / AC-003: Browser and button navigation protect unsaved edits and active writes. Loading/failure remain on the requested page with Refresh recovery.
- FR-004 / AC-004: Legacy hello-world, view and attempt query links redirect to canonical routes without dropping context. Unknown local paths recover to explore.

## Quality and boundaries
Retain standalone OnPush/MVVM and generated API types. Backend status decides workspace versus results. Angular route tests use HTTP doubles; hosted authentication/deployment remains an integration check.

## Decisions
Use relative paths below the host mount. Retain hello-world solely as a migration redirect. Loading and request errors are transient UI states, not separate navigation destinations. Drafts stay scoped to a page; accepted route exits may discard unsaved edits after confirmation.
