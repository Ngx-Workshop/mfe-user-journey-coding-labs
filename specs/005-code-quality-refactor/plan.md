# Implementation plan: coding labs quality refactor

Status: Complete · Updated: 2026-10-11 · Spec: [spec.md](spec.md)

## Design and sequence
1. Keep `api/coding-labs-api.service.ts` stateless. Move save-before-submit into
   `state/coding-labs.store.ts`: one deferred busy transaction, ordered save then
   submit, emit saved progress before grading so recovery uses the new revision.
   Use map for synchronous DTO composition and switchMap for replaceable reads.
2. Add scoped `pages/journey/lab-workspace.view-model.ts` for attempt/content,
   drafts, dirty/saved state and duplicate-sensitive command streams. Journey VM
   owns navigation, catalog filtering and workshop context, consuming workspace
   command outcomes without putting router or drafts in singleton state.
3. Keep exported `App` as the scoped composition/lifecycle boundary. Extract typed
   navigation, workshop banner and request feedback presentation. Add a nested
   journey-content orchestration component that consumes the same scoped VM and
   composes catalog/history/runner/result. Root owns focus and beforeunload.
4. Extract the hero illustration as a cohesive presentation component. Keep all
   component views inline and SCSS alongside them; preserve theme inheritance,
   layout breakpoints, content, accessible labels and BEM styling.
5. Strengthen architecture checks to reject VM/state/API imports in presentation,
   UI dependencies in state/API and mutable state in API. Preserve meaningful
   existing tests; add transaction, cancellation and API boundary coverage.
6. Run architecture check, strict source types, full ChromeHeadless tests, isolated
   production build and inspect component sizes. Update architecture/development
   documentation, task evidence and handoff.

## Constitution, compatibility and risks
All six principles apply and are satisfied by the proposed boundaries. Existing
generated DTO snapshot exception remains; this work does not change it. No component
size exception is planned. Public named/default App, Routes, federation identity,
HTTP payloads and route/query behavior remain compatible. No external dependencies
or deployment required. Greatest risks are scoped-provider duplication, cancellation
loading cleanup, save revision recovery and losing host theme inheritance after
extraction; behavior tests and the optimized build cover the local boundaries.

## Verification mapping
AC-001/004: architecture checker, API tests, strict source check and component sizes.
AC-002: store/workspace tests for ordering, failure, busy lifetime and duplicate writes.
AC-003: existing App, Journey VM and RouterTestingHarness suite, hosted baseline inspection.
Browser baseline and local tests are distinct from deployed end-to-end verification.
