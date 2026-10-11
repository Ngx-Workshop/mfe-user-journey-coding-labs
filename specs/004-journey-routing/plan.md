# Plan: Route-driven learner journey
Status: Implemented; hosted integration pending · 2026-10-11

Baseline: app.routes.ts mounts App at hello-world; JourneyViewModel interprets query parameters; bootstrap renders App outside a RouterOutlet.

FR-001: Define explore/history/attempts/results routes with view data and attemptId params; bootstrap a lightweight outlet root so standalone and federated routing agree.
FR-002: Read settled route snapshots on NavigationEnd, navigate relative to the current route parent, normalize attempt status after loading/submission using replaceUrl.
FR-003: Preserve canDeactivate and beforeunload; guard same-route parameter changes through a dedicated navigation coordinator. Suppress duplicate confirmation for approved button navigation; keep API/store independent of Router.
FR-004: Redirect legacy entry/query links through UrlTrees preserving host prefix and query context; local wildcard recovers to explore.

Constitution: Preserve App/Routes exports, exposures, versions and backend ownership. Route contract change is explicitly requested; keep legacy redirects. Runtime additions remain under features, mirrored tests under testing/app. Scoped drafts can survive query refresh but are discarded on approved route exit.

Verification: Angular RouterTestingHarness with HTTP doubles for host mounts, redirects, state reconciliation, dirty back/parameter navigation and errors; existing command tests; architecture, source type checks, isolated production build. Host registration/deployment are external and not performed here.
