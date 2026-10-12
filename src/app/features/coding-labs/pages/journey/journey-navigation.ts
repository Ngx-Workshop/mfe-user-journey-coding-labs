import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/** Protect parameter changes, which Angular does not treat as route deactivation. */
@Injectable({ providedIn: 'root' })
export class JourneyNavigation {
  canLeave: (() => boolean) | null = null;
}

export const protectJourneyParams: CanActivateFn = (next) => {
  let current = inject(Router).routerState.snapshot.root;
  while (current.firstChild) current = current.firstChild;
  return (
    current.routeConfig !== next.routeConfig ||
    (inject(JourneyNavigation).canLeave?.() ?? true)
  );
};
