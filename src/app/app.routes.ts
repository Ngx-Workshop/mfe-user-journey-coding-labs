import { inject } from '@angular/core';
import { RedirectFunction, Route, Router, UrlSegment } from '@angular/router';
import App from './app';
import { protectJourneyParams } from './features/coding-labs/pages/journey/journey-navigation';

// Retain old workshop/bookmark links while making path segments authoritative.
const legacyEntry: RedirectFunction = ({ queryParams }) => {
  const router = inject(Router);
  const tree = router.parseUrl(router.getCurrentNavigation()?.extractedUrl.toString() ?? '/');
  const group = tree.root.children['primary'];
  const segments = group?.segments.slice() ?? [];
  if (segments.at(-1)?.path === 'hello-world') segments.pop();
  const destination = queryParams['attempt']
    ? ['attempts', queryParams['attempt']]
    : [queryParams['view'] === 'history' ? 'history' : 'explore'];
  const path = [...segments, ...destination.map(part => new UrlSegment(part, {}))];
  const target = router.parseUrl('/' + path.map(segment => segment.toString()).join('/'));
  target.queryParams = { ...queryParams };
  delete target.queryParams['attempt']; delete target.queryParams['view'];
  target.fragment = tree.fragment;
  return target;
};

export const Routes: Route[] = [
  { path: '', redirectTo: legacyEntry, pathMatch: 'full' },
  { path: 'hello-world', redirectTo: legacyEntry, pathMatch: 'full' },
  ...[
    { path: 'explore', view: 'explore' },
    { path: 'history', view: 'history' },
    { path: 'attempts/:attemptId', view: 'attempt' },
    { path: 'results/:attemptId', view: 'result' },
  ].map(({ path, view }): Route => ({
    path, component: App, data: { view },
    canActivate: [protectJourneyParams], runGuardsAndResolvers: 'always',
    canDeactivate: [(app: App) => app.vm.canLeave()],
  })),
  { path: '**', redirectTo: 'explore' },
];
