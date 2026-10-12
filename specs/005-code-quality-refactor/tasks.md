# Tasks: coding labs quality refactor

Updated: 2026-10-11 · [Spec](spec.md) · [Plan](plan.md)

- [x] T001 — Inspect all runtime layers, existing tests, instructions and signed-in hosted baseline; record plan. FR-001–004.
- [x] T002 — Move save/submit transaction into store and local workspace state/commands into scoped VM. FR-001/002; verify existing command and route tests plus transaction tests.
- [x] T003 — Extract root presentation/content orchestration and decorative hero. FR-003/004; verify App rendering, inline BEM, size checks and production build.
- [x] T004 — Strengthen architecture checks and add API/stream regression coverage. FR-001/002/004; verify checker and ChromeHeadless suite.
- [x] T005 — Run strict types, architecture, full tests and isolated optimized build; update context and handoff. All acceptance scenarios.

No external implementation tasks. Deployment walkthrough of modified source remains a release check.

## Evidence
T002: existing command/route tests plus store transaction and scoped workspace tests pass.
T003: inline BEM components, App 188 lines, largest component 217; optimized build and desktop/phone preview pass.
T004: architecture checks pass without warnings; 10 added HTTP/stream/scope tests pass.
T005: 44 ChromeHeadless tests, strict source types, architecture, diff whitespace and isolated build pass; architecture/development docs and handoff updated.
