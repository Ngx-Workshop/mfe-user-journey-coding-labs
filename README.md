# mfe-user-journey-coding-labs

Learner coding labs for Ngx-Workshop, styled consistently with the learner assessment journey. Discover published labs, write TypeScript/JavaScript solutions, save/resume progress, submit to the isolated server runner, review historical results and retry without losing earlier attempts.

Use Node 22. Run `npm ci`, `npm run dev:bundle`, `npm run check:architecture`, `npm test -- --watch=false --browsers=ChromeHeadless`, and `npm run build`.

Federation exports remain ./Component (default App) and ./Routes (named Routes), mounted at /coding-labs/hello-world. The host supplies session HTTP interceptors, Router and theme. Browser APIs use /api/coding-labs and /api/user-metadata/coding-lab-attempts. The metadata service needs CODING_LABS_BASE_URL pointing to the coding service.

See [architecture](docs/architecture.md), [development](docs/development.md) and [learner handoff](specs/002-learner-journey/handoff.md). New server endpoints and generated contracts must be released before the live learner flow can work. This implementation does not publish packages or deploy services.
