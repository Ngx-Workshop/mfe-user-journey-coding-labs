# Handoff: coding labs quality refactor

Status: Complete · Updated: 2026-10-11
[Spec](spec.md) · [Plan](plan.md) · [Tasks](tasks.md)

## Delivered
- API remains stateless and independent of singleton/view state.
- Store owns catalog/history and a single busy save-before-submit transaction using
  the returned revision, publishing saved progress before grading.
- Scoped workspace VM owns drafts, attempt/content and duplicate-sensitive commands;
  scoped journey VM owns routing/workshop/filter policy. Both expose readonly signals.
- App provides both models once and owns lifecycle/focus. Nested content orchestration
  reuses that scope. Navigation, workshop banner, request feedback and hero artwork
  are separate presentation components with inline HTML/SCSS and BEM/theme styling.
- App shrank from 444 to 188 lines; hero from 282 to 137. Largest component is the
  existing 217-line catalog. No component-size exception is needed.
- Architecture checker enforces presentation/VM/data dependency directions and scoped VMs.

## Verification
| Scenario/check | Method | Result and limits |
| --- | --- | --- |
| Baseline | Existing ChromeHeadless suite | 34 passing before implementation |
| AC-001/002/003 | npm test -- --watch=false --browsers=ChromeHeadless | 44 passing; HTTP doubles and real Angular RouterTestingHarness, including 10 new API/transaction/cancellation/scope tests |
| AC-001/004 | npm run check:architecture | PASS, no size warnings; added forbidden-dependency smoke checks pass |
| AC-001/004 | npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json | PASS |
| AC-003/004 | npm run build -- --output-path dist/learner-verification | PASS, optimized federation output |
| AC-003/004 | Isolated browser preview, 1366×900 and 390×844 | PASS, no horizontal overflow, hero/navigation/status rendering, search/no-match and history routing/aria-current |
| Baseline integration | Signed-in beta explore page | Existing catalog and resume state observed; beta did not render the new navigation selector after reload, so this is not proof of the new hosted bundle |
| Diff hygiene | git diff --check | PASS |

The standalone static preview has no API gateway: 404 responses exercised honest
error/empty states. New data flows were verified with HTTP doubles, not deployed
services. Node 24.9.0 was available (development guide recommends Node 22).
One new scope test initially destroyed its injector twice during cleanup; the test
cleanup was corrected and the final 44-test suite passes. No baseline failures.

## Contracts and remaining work
No route, federation exposure/export, HTTP payload, service, schema or dependency
change. Existing generated contract snapshots remain. No external implementation
or local task remains. As a release check, load the new bundle in the signed-in
host and walk through save/submit/results/workshop return with real services.
No deploy, commit or package publication was performed. Existing local server and
its build directory were left intact; the isolated preview server was stopped.

## Context maintenance
Updated architecture source map/boundaries, corrected its declared contract-package
version description, added development verification evidence and indexed this feature.
