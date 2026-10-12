# Plan: coding-lab shared hero

Status: Complete · Spec: [spec.md](spec.md)

Keep LabHeroComponent as a content/theme adapter. Project a local
LabHeroBackgroundComponent and existing LabHeroArtComponent into NgxHero.
The background uses rising translucent bubbles; artwork shows three glass test
tubes with colored liquids, bubbling reactions and a rack. Components stay standalone OnPush, inline/BEM and under approximately 230
lines. Theme tokens inherit from the root; both components consume the shared
animation-play-state property and honor prefers-reduced-motion.

Reuse the already-built immutable 21.0.3 vendor archive used by the other consumers;
no producer change is required. Install it as a runtime dependency and preserve
unrelated lockfile entries. No API/store/VM imports or subscriptions are added.

Verify composed copy/slots and actual computed pause state in browser tests, full
suite, architecture guard, strict source type/unused checks and isolated production
build. Inspect desktop and phone optimized renders and reduced-motion styles.
Static previews do not establish signed-in host/service integration.
