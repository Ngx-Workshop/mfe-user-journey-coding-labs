import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, combineLatest, startWith, of, catchError, exhaustMap, finalize, switchMap, tap } from 'rxjs';
import { CodingLabsStore } from '../../state/coding-labs.store';
import { LabAttempt, LabView, PublishedLab } from '../../models/coding-labs.models';
import { labError } from '../../utils/lab-error';
type Command = { kind: 'start'; labId: string } | { kind: 'save' | 'submit' };
@Injectable()
export class JourneyViewModel {
  private readonly store = inject(CodingLabsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly drafts = new Map<string, string>();
  private readonly reloads = new Subject<void>();
  private readonly commands = new Subject<Command>();
  readonly labs = this.store.labs;
  readonly attempts = this.store.attempts;
  readonly busy = this.store.busy;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly detailError = signal('');
  readonly detailLoading = signal(false);
  readonly view = signal<LabView>('explore');
  readonly attempt = signal<LabAttempt | null>(null);
  readonly content = signal<PublishedLab | null>(null);
  readonly code = signal('');
  readonly saved = signal(false);
  readonly search = signal('');
  readonly dirty = computed(() => { const attempt = this.attempt(); return !!attempt && attempt.status !== 'completed' && this.code() !== attempt.code; });
  readonly filtered = computed(() => this.labs().filter(lab => `${lab.title} ${lab.summary} ${lab.tags.join(' ')}`.toLowerCase().includes(this.search().toLowerCase())));
  readonly completed = computed(() => this.attempts().filter(a => a.status === 'completed'));
  readonly passed = computed(() => this.completed().filter(a => a.result?.passed));
  constructor() {
    combineLatest([this.route.queryParamMap, this.reloads.pipe(startWith(undefined))]).pipe(switchMap(([params]) => {
      const previous = this.attempt();
      if (previous && this.dirty()) this.drafts.set(previous._id, this.code());
      const id = params.get('attempt');
      this.view.set(id ? 'attempt' : params.get('view') === 'history' ? 'history' : 'explore');
      this.attempt.set(null); this.content.set(null); this.detailError.set(''); this.saved.set(false);
      if (!id) return EMPTY;
      this.detailLoading.set(true);
      return this.store.loadAttempt(id).pipe(tap(({ attempt, content }) => {
        this.attempt.set(attempt); this.content.set(content); this.code.set(this.drafts.get(attempt._id) ?? attempt.code);
      }), catchError(error => { this.detailError.set(labError(error)); return EMPTY; }), finalize(() => this.detailLoading.set(false)));
    }), takeUntilDestroyed(this.destroy)).subscribe();
    this.commands.pipe(exhaustMap(command => {
      if (command.kind === 'start') return this.store.start({ labId: command.labId, requestId: crypto.randomUUID() }).pipe(tap(a => { if (a) this.navigateToAttempt(a); }));
      const attempt = this.attempt();
      if (!attempt || attempt.status === 'completed') return EMPTY;
      const body = { code: this.code(), revision: attempt.revision };
      const request = command.kind === 'submit'
        ? (this.dirty() ? this.store.save(attempt._id, body).pipe(tap(saved => {
            if (saved && this.attempt()?._id === saved._id) this.attempt.set(saved);
          })) : of(attempt)).pipe(switchMap(saved => saved
            ? this.store.submit(saved._id, { code: saved.code, revision: saved.revision }) : of(null)))
        : this.store.save(attempt._id, body);
      return request.pipe(tap(a => { if (a && this.attempt()?._id === a._id) { this.attempt.set(a); this.drafts.delete(a._id); this.saved.set(true); } }));
    }), takeUntilDestroyed(this.destroy)).subscribe();
    this.store.refresh();
  }
  refresh() { if (!this.canLeave()) return; this.store.refresh(); this.reloads.next(); }
  navigate(view: 'explore' | 'history') {
    if (this.busy() || !this.canLeave()) return;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { view: view === 'history' ? view : null, attempt: null } });
  }
  canLeave() { return !this.dirty() || this.attempt()?.status === 'completed' || confirm('Your latest changes have not been saved. Leave this lab?'); }
  open(attempt: LabAttempt) {
    if (this.busy() || !this.canLeave()) return;
    this.navigateToAttempt(attempt);
  }
  private navigateToAttempt(attempt: LabAttempt) {
    void this.router.navigate([], { relativeTo: this.route, queryParams: { attempt: attempt._id } });
  }
  start(labId: string) { if (!this.busy() && this.canLeave()) this.commands.next({ kind: 'start', labId }); }
  save() { this.commands.next({ kind: 'save' }); }
  submit() { this.commands.next({ kind: 'submit' }); }
  edit(code: string) { this.code.set(code); this.saved.set(false); }
  inProgress(labId: string) { return this.attempts().find(a => a.labId === labId && a.status === 'in-progress'); }
}
