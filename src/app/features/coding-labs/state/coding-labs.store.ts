import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subject, catchError, defer, finalize, forkJoin, of, switchMap, tap } from 'rxjs';
import { CodingLabsApi } from '../api/coding-labs-api.service';
import { LabAttempt, LabSummary, SaveAttempt, StartAttempt } from '../models/coding-labs.models';
import { labError } from '../utils/lab-error';
@Injectable({ providedIn: 'root' })
export class CodingLabsStore {
  private readonly api = inject(CodingLabsApi);
  private readonly refreshes = new Subject<void>();
  private readonly labsState = signal<LabSummary[]>([]);
  private readonly attemptsState = signal<LabAttempt[]>([]);
  private readonly loadingState = signal(false);
  private readonly pendingState = signal(0);
  private readonly errorState = signal('');
  readonly labs = this.labsState.asReadonly();
  readonly attempts = this.attemptsState.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly busy = computed(() => this.pendingState() > 0);
  readonly error = this.errorState.asReadonly();
  constructor() {
    this.refreshes.pipe(switchMap(() => {
      this.loadingState.set(true); this.errorState.set('');
      return forkJoin({ labs: this.api.catalog(), attempts: this.api.history() }).pipe(
        tap(data => { this.labsState.set(data.labs); this.attemptsState.set(data.attempts); }),
        catchError(error => { this.errorState.set(labError(error)); return of(null); }),
        finalize(() => this.loadingState.set(false)));
    }), takeUntilDestroyed(inject(DestroyRef))).subscribe();
  }
  refresh() { this.refreshes.next(); }
  clearError() { this.errorState.set(''); }
  loadAttempt(id: string) { return this.api.attempt(id).pipe(switchMap(attempt => attempt.status === 'completed' ? of({ attempt, content: null }) : this.api.content(attempt.labId, attempt.versionId).pipe(
    switchMap(content => of({ attempt, content }))))); }
  start(body: StartAttempt) { return this.command(this.api.start(body)); }
  save(id: string, body: SaveAttempt) { return this.command(this.api.save(id, body)); }
  submit(id: string, body: SaveAttempt) { return this.command(this.api.submit(id, body)); }
  private command(request: Observable<LabAttempt>) {
    return defer(() => {
      this.pendingState.update(count => count + 1); this.errorState.set('');
      return request.pipe(tap(attempt => this.attemptsState.update(items => [attempt, ...items.filter(a => a._id !== attempt._id)])),
        catchError(error => { this.errorState.set(labError(error)); return of(null); }),
        finalize(() => this.pendingState.update(count => count - 1)));
    });
  }
}
