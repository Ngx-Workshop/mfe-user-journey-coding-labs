# Learner coding labs architecture

Updated 2026-10-11. This remote owns published lab discovery, a coding workspace, saved progress, server-scored results, history and retry. Authoring remains in mfe-user-journey-admin-coding-labs. Coding service owns challenge definitions and grading; user metadata owns authenticated attempt persistence.

## Source map and flow

`src/app/features/coding-labs`: stateless `api/`, generated DTO snapshots in `models/`, singleton `state/`, scoped `pages/journey/` view model, focused `components/` (hero/catalog/history/editor/runner/result), shared theme `styles/`, user errors in `utils/`. Tests mirror production under `testing/app`; fixtures are test-only.

HTTP → store → scoped view model → OnPush presentation. Query parameters `view=history` and `attempt=<id>` support browser navigation and reload. Replaceable reads use switchMap; duplicate-sensitive commands use exhaustMap. Submission first saves edited code, then grades using the saved revision. Busy state counts requests so chained save/submit stays disabled throughout. Conflicts retain local code; refresh requires confirmation before replacing unsaved edits. A route exit guard and beforeunload protect unsaved work. Scoped in-memory drafts survive query navigation without entering singleton state or browser storage.

CodeMirror owns only the editor view, emits code changes and releases resources on destruction. Tab remains available for keyboard navigation. Markdown uses Angular sanitized innerHTML with no trust bypass. Completed results need only the persisted attempt, so archiving a lab does not hide historical solutions. Retry uses current publication or resumes an existing unfinished attempt, preserving prior results.

## Federation and providers

Preserved named/default App, named Routes, ./Component, ./Routes, remoteEntry.js, mfe-user-journey-coding-labs identity, hello-world route and Angular 21.1 shared compatibility. Standalone appConfig provides HttpClient and Router; federated consumers use host providers/session interceptors/theme. Existing production webpack concatenation repair remains. No remote nesting.

## Browser contracts

All requests use credentials and gateway paths; no production service address is embedded.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | /api/coding-labs/published-labs | Published redacted catalog |
| GET | /api/coding-labs/published-labs/:labId?versionId=... | Pinned published content |
| GET | /api/user-metadata/coding-lab-attempts | Owned history including in-progress attempts |
| GET | /api/user-metadata/coding-lab-attempts/:id | Owned code/result/revision |
| POST | /api/user-metadata/coding-lab-attempts | Start/resume, labId + UUID requestId |
| PATCH | /api/user-metadata/coding-lab-attempts/:id | Save code + revision |
| POST | /api/user-metadata/coding-lab-attempts/:id/submit | Server grade, code + revision |

The metadata service calls authenticated POST /published-labs/:labId/grade on its configured CODING_LABS_BASE_URL. Neither browser nor metadata chooses tests or claims a score. Sample feedback is visible; hidden test inputs, names, outputs, expected answers, references and hashes are excluded.

The installed published coding-labs-contracts 0.0.6 predates these additive endpoints. Temporary generated `*.contract.ts` snapshots come from producer OpenAPI (never handwritten DTO replacements). After contract releases, replace snapshots with published imports. The snapshot exception is documented in the feature plan. LABS_API and ATTEMPTS_API injection tokens permit configured local test gateways.

Deployment directory remains /opt/mfe-remotes/mfe-user-journey-coding-labs. Source implementation does not deploy services, publish packages, change remote registration or install host providers.

## Workshop continuity — 2026-10-11

See [003 continuity](../specs/003-workshop-continuity/handoff.md). Workshop reader route is `/workshops/overview`, matching its executable Routes. Activities accept `returnTo` (validated to that reader route and workshop/page query keys) and `workshopName`. Assessments accept an exact `test` definition ID; labs accept an exact published `lab` ID. Activity navigation merges query context; return reloads the server catalog and restores the lesson. No automatic starts or altered completion policy. Host Router owns cross-remote navigation; no nested remotes.

### Automatic workshop return
Workshop context now returns automatically on confirmed assignment submission: assessment finish or a completed coding-lab submit response. Return uses the validated workshop/page destination with replaceUrl. Save-only, failures and historical loads keep their current views; ordinary result navigation remains for assignments without workshop context. Workshop return reloads authoritative progress. Learner copy explains the automatic return.

### Direct workshop assignment links
Explicit resource links include `launch=direct`. After authoritative catalog/history loading, the scoped activity VM starts or resumes the exact eligible resource once, removes launch on internal navigation, and preserves returnTo/workshopName. Assessment completed references open saved results. Missing/locked resources and failed starts do not loop; explicit Refresh retries. This supersedes discovery-only entry for workshop assignment links. Ordinary discovery and placement remain available.
