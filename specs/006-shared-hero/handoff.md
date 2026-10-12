# Handoff: coding-lab shared hero

Status: Complete · Updated: 2026-10-12
Spec: [spec.md](spec.md) · Plan: [plan.md](plan.md) · Tasks: [tasks.md](tasks.md)

## Delivered behavior

LabHeroComponent now supplies its existing copy/tags and theme mappings to NgxHero.
Local LabHeroBackgroundComponent projects 40 rising translucent bubbles through
heroBackground; LabHeroArtComponent projects three glass test tubes with colored liquids, nine animated reaction bubbles and a rack through heroArt,
replacing the previous chapter/bar-card artwork. Both decorations obey the shared
animation-play-state property and reduced-motion CSS. NgxHero owns responsive sizing,
aria-hidden slots and one accessible pause control. All three local components
remain OnPush with inline BEM views/styles and are below approximately 230 lines.

## Verification

| Check | Result |
| --- | --- |
| Full ChromeHeadless suite | PASS: 46 tests, including 2 hero composition/motion tests |
| Production build to dist/shared-hero-verification | PASS |
| Strict source types and unused symbols | PASS |
| Architecture guard | PASS, no size warnings |
| Vendor archive integrity and installed code/declarations/manifest | PASS |
| Optimized desktop (1366px) and phone (390px) | PASS: no horizontal overflow; phone art hidden |
| Reduced motion | PASS: background/toggle hidden and art animation none |
| Desktop/phone visual review | PASS |

The motion test checks actual computed pause/resume state on every projected background/reaction bubble
and the artwork. Browser previews served only optimized static assets, so catalog
requests showed expected unavailable-API errors. Tests use HTTP doubles. No new
signed-in host/gateway/grading integration is claimed. Temporary screenshots are
under /tmp/coding-lab-hero-previews; the preview server was stopped afterward.

## Consumer contract and remaining work

The remote consumes file:vendor/tmdjr-ngx-shared-headers-21.0.3.tgz, the same immutable
package as assessment/workshop. No producer source change, new package version or
federation singleton is needed. Angular/Material compatibility, App/Routes exports,
API calls and journey state remain intact. Unrelated lockfile entries were retained.

Source implementation is complete. Registry publication/deployment and any later
switch from the vendor archive to a released dependency remain release work outside
this request. Architecture/development guides and feature index were updated.

## Mad-scientist visual revision — 2026-10-12

The user's laboratory theme supersedes the earlier circuit/terminal design.
Background bubbles vary in size, drift and timing; phones show 24 of the 40 bubbles.
Test tubes use primary, tertiary and secondary theme colors with different liquid
levels, glass rims, highlights and measurement marks. The shared pause control
reaches background bubbles, tube reactions and the gentle artwork sway.

Revision verification: the 2 focused hero tests, production build and architecture
check pass. Desktop/phone/reduced-motion renders were rechecked. The previous full
46-test suite evidence above predates this visual revision; only focused tests were
rerun because no journey logic or shared-library contract changed.
