# Coding labs quality refactor

Status: Complete · Created: 2026-10-11
Request: refactor the learner journey to MVVM, idiomatic streams, inline views and BEM.

## Problem, scope and evidence
The HTTP client is already stateless and the root store already owns catalog/history.
`src/app/app.ts` is 444 lines and mixes journey composition, navigation, workshop
context, request feedback and content selection. `journey.view-model.ts` is 357
lines and mixes route state, local drafts and save/submit orchestration. The hero
is 282 lines, including a self-contained decorative illustration. Other components
are typed OnPush presentation with inline SCSS and BEM; retain these boundaries.
The working tree was clean at a9ad4d7. Generated contract snapshots are not handwritten
application code and are outside this refactor. No server, dependency or deployment changes.

## Requirements and acceptance
- FR-001 / AC-001: Stateless HTTP → singleton data orchestration → scoped view models
  → orchestration/presentation components. Presentation never injects a store or VM.
- FR-002 / AC-002: Drafts stay scoped; failed saves retain edits; failed grading retains
  the saved revision; save-before-submit is one busy transaction and duplicates are ignored.
- FR-003 / AC-003: Preserve discovery/search, loading/empty/error recovery, historical
  results, retry, workshop continuity, deep links, guards, keyboard focus and federation exports.
- FR-004 / AC-004: Inline HTML/SCSS, BEM classes, theme tokens and approximately 230
  lines per component; architecture verification enforces the layer boundaries.

## Success criteria and assumptions
Architecture check, strict unused/source types, full existing and added behavior
suite and isolated production build pass. Browser inspect the signed-in hosted
journey as a baseline; deployed integration of modified source is outside scope.
Keep Angular 21.1 and current API contracts. No data migration or external owner action.
