import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, combineLatest, startWith, of, catchError, exhaustMap, finalize, filter, map, distinctUntilChanged, switchMap, tap } from 'rxjs';
import { CodingLabsStore } from '../../state/coding-labs.store';
import { LabAttempt, LabView, PublishedLab } from '../../models/coding-labs.models';
import { workshopReturn } from '../../utils/workshop-context';
import { labError } from '../../utils/lab-error';
import { JourneyNavigation } from './journey-navigation';
type Command = { kind: 'start'; labId: string } | { kind: 'save' | 'submit' };
@Injectable()
export class JourneyViewModel {
  private readonly store = inject(CodingLabsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private leaving = false;
  private handledLaunch: string | null = null;
  readonly directLaunch = signal(false);
  readonly openingAssignment = computed(() => this.directLaunch() && this.busy());
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
  readonly labId = signal<string | null>(null);
  readonly returnTo = signal<string | null>(null);
  readonly workshopName = signal('Your workshops');
  readonly missingLab = computed(() => !!this.labId() && !this.loading() && !this.error() && !this.labs().some(lab => lab.labId === this.labId()));
  readonly dirty = computed(() => { const attempt = this.attempt(); return !!attempt && attempt.status !== 'completed' && this.code() !== attempt.code; });
  readonly filtered = computed(() => this.labs().filter(lab => (!this.labId() || lab.labId === this.labId()) && `${lab.title} ${lab.summary} ${lab.tags.join(' ')}`.toLowerCase().includes(this.search().toLowerCase())));
  readonly completed = computed(() => this.attempts().filter(a => a.status === 'completed'));
  readonly passed = computed(() => this.completed().filter(a => a.result?.passed));
  constructor() {
    const navigation = inject(JourneyNavigation);
    const canLeave = () => this.canLeave();
    navigation.canLeave = canLeave;
    this.destroy.onDestroy(() => { if (navigation.canLeave === canLeave) navigation.canLeave = null; });
    const routeState = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd), startWith(null),
      map(() => this.route.snapshot), distinctUntilChanged(),
    );
    combineLatest([routeState, this.reloads.pipe(startWith(undefined))]).pipe(
      switchMap(([snapshot]) => {
        const params = snapshot.queryParamMap;
        const previous = this.attempt();
        if (previous && this.dirty()) this.drafts.set(previous._id, this.code());
        this.directLaunch.set(params.get('launch') === 'direct' && !snapshot.paramMap.get('attemptId'));
        if (!this.directLaunch()) this.handledLaunch = null;
        this.returnTo.set(workshopReturn(params.get('returnTo')));
        this.workshopName.set(params.get('workshopName') || 'Your workshops');
        this.labId.set(params.get('lab'));
        const id = snapshot.paramMap.get('attemptId');
        this.view.set(snapshot.data['view'] ?? 'explore');
        this.detailLoading.set(false);
        this.attempt.set(null); this.content.set(null); this.detailError.set(''); this.saved.set(false);
        if (!id) return EMPTY;
        this.detailLoading.set(true);
        return this.store.loadAttempt(id).pipe(tap(({ attempt, content }) => {
          this.attempt.set(attempt); this.content.set(content); this.code.set(this.drafts.get(attempt._id) ?? attempt.code);
          const expected = attempt.status === 'completed' ? 'result' : 'attempt';
          if (this.view() !== expected) this.navigateToAttempt(attempt, true);
        }), catchError(error => { this.detailError.set(labError(error)); return EMPTY; }), finalize(() => this.detailLoading.set(false)));
      }), takeUntilDestroyed(this.destroy)).subscribe();
    this.commands.pipe(exhaustMap(command => {
      if (command.kind === 'start') return this.store.start({ labId: command.labId, requestId: crypto.randomUUID() }).pipe(tap(a => { if (a) this.navigateToAttempt(a); }));
      const attempt = this.attempt();
      if (!attempt || attempt.status === 'completed') return EMPTY;
      const workshop = this.returnTo();
      const body = { code: this.code(), revision: attempt.revision };
      const request = command.kind === 'submit'
        ? (this.dirty() ? this.store.save(attempt._id, body).pipe(tap(saved => {
            if (saved && this.attempt()?._id === saved._id) this.attempt.set(saved);
          })) : of(attempt)).pipe(switchMap(saved => saved
            ? this.store.submit(saved._id, { code: saved.code, revision: saved.revision }) : of(null)))
        : this.store.save(attempt._id, body);
      return request.pipe(tap(a => {
        if (!a || this.attempt()?._id !== a._id) return;
        this.attempt.set(a); this.drafts.delete(a._id); this.saved.set(true);
        if (command.kind === 'submit' && a.status === 'completed' && workshop && this.returnTo() === workshop) {
          void this.router.navigateByUrl(workshop, { replaceUrl: true });
        } else if (command.kind === 'submit' && a.status === 'completed') {
          this.navigateToAttempt(a, true);
        }
      }));
    }), takeUntilDestroyed(this.destroy)).subscribe();
    effect(() => {
      if (!this.directLaunch() || this.loading() || this.busy() || this.error()) return;
      const lab = this.labs().find(l => l.labId === this.labId());
      if (!lab) return;
      const key = JSON.stringify([lab.labId, this.returnTo()]);
      if (this.handledLaunch === key) return;
      this.handledLaunch = key;
      const active = this.attempts().find(a => a.labId === lab.labId && a.status === 'in-progress');
      untracked(() => active ? this.open(active) : this.start(lab.labId));
    });
    this.store.refresh();
  }
  refresh() { if (!this.canLeave()) return; this.handledLaunch = null; this.store.refresh(); this.reloads.next(); }
  navigate(view: 'explore' | 'history') {
    if (this.busy() || !this.canLeave()) return;
    this.navigatePath([view], { view: null, attempt: null, launch: null });
  }
  returnToWorkshop() {
    const url = this.returnTo();
    if (url && !this.busy() && this.canLeave()) {
      this.leaving = true;
      void this.router.navigateByUrl(url).finally(() => this.leaving = false);
    }
  }
  showAllLabs() {
    if (!this.busy() && this.canLeave()) this.navigatePath(['explore'], { lab: null, view: null, attempt: null, launch: null });
  }
  canLeave() {
    if (this.leaving) return true;
    if (this.busy()) return false;
    return !this.dirty() || this.attempt()?.status === 'completed' || confirm('Your latest changes have not been saved. Leave this lab?');
  }
  open(attempt: LabAttempt) {
    if (this.busy() || !this.canLeave()) return;
    this.navigateToAttempt(attempt);
  }
  private navigateToAttempt(attempt: LabAttempt, replaceUrl = this.directLaunch()) {
    this.navigatePath([attempt.status === 'completed' ? 'results' : 'attempts', attempt._id], { view: null, attempt: null, launch: null }, replaceUrl);
  }
  private navigatePath(path: string[], queryParams: Record<string, null>, replaceUrl = false) {
    this.leaving = true;
    void this.router.navigate(path, { relativeTo: this.route.parent, queryParams, queryParamsHandling: 'merge', replaceUrl })
      .finally(() => this.leaving = false);
  }
  start(labId: string) { if (!this.busy() && this.canLeave()) this.commands.next({ kind: 'start', labId }); }
  save() { this.commands.next({ kind: 'save' }); }
  submit() { this.commands.next({ kind: 'submit' }); }
  edit(code: string) { this.code.set(code); this.saved.set(false); }
  inProgress(labId: string) { return this.attempts().find(a => a.labId === labId && a.status === 'in-progress'); }
}
