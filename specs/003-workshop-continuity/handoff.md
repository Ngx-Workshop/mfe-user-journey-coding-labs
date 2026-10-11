# Workshop continuity handoff
Status: Implemented; hosted integration pending
Updated: 2026-10-11

## Delivered
Workshop catalog adopts the assessment/lab hero, theme aliases, gutters, footer and panels. Reader separates ordered contents from lesson content, identifies optional labs, preserves page-save retry, and continues to the next activity (skipping completed assessments). Assessment links select exact test IDs; lab links select exact published lab IDs without automatically starting attempts. Unavailable references have explicit recovery states.

Both activity journeys retain workshopName and a validated returnTo through start/resume/history/results. Return restores workshop/page and reloads server progress. Assessment return is disabled during an active runner until Save & exit or submission; labs protect unsaved code and confirm once across the route exit guard. Normal workshop activity clicks use the host Router; modified clicks retain native links. Standalone labs now install their exported Routes so query navigation works.

## Verification
- PASS: 17 ChromeHeadless tests in this repository using HTTP doubles. Combined total: 51 (12 workshops, 17 labs, 22 assessments).
- PASS: isolated optimized federation build at /tmp/mfe-user-journey-coding-labs-continuity-build.
- PASS: source TypeScript including unused symbols; git diff --check.
- PASS: architecture guards in workshops and labs. Assessment repository has no architecture command; its MVVM, typed inline BEM and mirrored test conventions were reviewed.
- PASS: eight synthetic browser previews covering catalog, reader, exact assessment and exact lab at 1366px and 390px. No page errors or horizontal overflow. Rendered resource links and return banners checked. Previews use local HTTP doubles; no live attempt mutations.

## Contracts and discrepancies
Additive query parameters: workshops workshop/page; assessment test; labs lab; activities returnTo/workshopName. Return allows only /workshops/overview and workshop/page parameters. API DTOs, scoring, server completion criteria and federation exports are unchanged. Labs remain optional practice.

Executable workshop Routes use overview; earlier docs referred to hello-world. New links use the executable overview route. Coding labs README confirms /coding-labs/hello-world; assessments use /take-assessment-test/overview. Hosted shell supplies cross-remote routes/session providers. Standalone previews do not validate cross-remote Router transitions.

## Remaining integration
X001: release all three compatible remotes, then verify signed-in placement → workshop lesson → exact assessment → result → return → optional lab → save/submit → return in the shell. Check refreshed completion and browser back/forward. No deployment, publication or production data change performed.

## Context
Architecture and development guides describe the additive navigation contract. Preview images alongside this handoff are synthetic review artifacts.

## Automatic completion return — 2026-10-11
Workshop-launched assignments now return automatically to validated returnTo after confirmed completion, using replaceUrl and retaining workshop/page selection. Assessment runner emits finish only after successful submission or owned completed-result reconciliation; the journey redirects instead of opening result. Lab VM redirects only from a completed active submit response, after updating its saved attempt; the captured return destination must still match current context. Nonpassing but completed lab attempts also return, following persisted status. Save-only, failed save/submit, noncompleted responses and historical loads do not redirect. Missing/invalid context keeps ordinary result/history behavior. Workshop constructor reloads progress and restores the lesson; scoring, API contracts and completion policy are unchanged.

Verification: 23 ChromeHeadless tests passed in this repository (63 combined: 14 workshops, 23 coding labs, 26 assessments). Isolated production build passed at /tmp/mfe-user-journey-coding-labs-autoreturn-build. Source type/unused checks and diff checks passed; architecture guards passed where provided. Tests use HTTP/Router doubles, covering redirect destination, replaceUrl, submission retry, persisted status, historical results and invalid/standalone contexts alongside existing runner persistence/reconciliation tests. No new signed-in host walkthrough or deployment was performed; X001 remains the release integration check.

## Direct assignment launch — 2026-10-11
Explicit workshop resource links now include launch=direct and the exact lab/test ID. After catalog/history loading, scoped VMs consume each launch once: eligible assessments start, existing assessment attempts resume/open their saved result; labs resume active attempts or start through the existing service retry rules. Internal attempt navigation replaces the launch URL and removes launch while preserving workshop return context. This supersedes the earlier discovery-only/no-auto-start behavior for workshop assignment links. Ordinary discovery and initial section placement links remain unchanged.

Missing/locked resources do not start; failed launches show the existing retry/error state and do not loop. Explicit Refresh may retry. Pending direct starts show progress instead of discovery. Completion still returns automatically to the saved workshop lesson after confirmed submission.

Verification: 26 ChromeHeadless tests pass in this checkout (71 combined: 14 workshops, 26 labs, 31 assessments). Production build passed at /tmp/mfe-user-journey-coding-labs-direct-build; source types/unused checks and diff checks pass, plus architecture guards where available. Synthetic browser checks opened the real coding editor and assessment runner from direct URLs, started each assignment exactly once, removed launch and retained returnTo with no page errors. HTTP/Router doubles and synthetic browser APIs do not prove signed-in host deployment; X001 remains pending. No backend or scoring contract changed.
