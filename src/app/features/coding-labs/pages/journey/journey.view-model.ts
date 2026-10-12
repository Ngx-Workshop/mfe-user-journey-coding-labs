import {
  DestroyRef,
  Injectable,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  combineLatest,
  startWith,
  filter,
  map,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs';
import { CodingLabsStore } from '../../state/coding-labs.store';
import { LabAttempt, LabView } from '../../models/coding-labs.models';
import { workshopReturn } from '../../utils/workshop-context';
import { JourneyNavigation } from './journey-navigation';
import { LabWorkspaceViewModel } from './lab-workspace.view-model';
@Injectable()
export class JourneyViewModel {
  private readonly store = inject(CodingLabsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private leaving = false;
  private handledLaunch: string | null = null;
  private readonly directLaunchState = signal(false);
  readonly directLaunch = this.directLaunchState.asReadonly();
  readonly openingAssignment = computed(
    () => this.directLaunch() && this.busy()
  );
  private readonly workspace = inject(LabWorkspaceViewModel);
  private readonly reloads = new Subject<void>();
  readonly labs = this.store.labs;
  readonly attempts = this.store.attempts;
  readonly busy = this.store.busy;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly detailError = this.workspace.detailError;
  readonly detailLoading = this.workspace.detailLoading;
  private readonly viewState = signal<LabView>('explore');
  readonly view = this.viewState.asReadonly();
  readonly attempt = this.workspace.attempt;
  readonly content = this.workspace.content;
  readonly code = this.workspace.code;
  readonly saved = this.workspace.saved;
  private readonly searchState = signal('');
  readonly search = this.searchState.asReadonly();
  private readonly labIdState = signal<string | null>(null);
  readonly labId = this.labIdState.asReadonly();
  private readonly returnToState = signal<string | null>(null);
  readonly returnTo = this.returnToState.asReadonly();
  private readonly workshopNameState = signal('Your workshops');
  readonly workshopName = this.workshopNameState.asReadonly();
  readonly missingLab = computed(
    () =>
      !!this.labId() &&
      !this.loading() &&
      !this.error() &&
      !this.labs().some((lab) => lab.labId === this.labId())
  );
  readonly dirty = this.workspace.dirty;
  readonly filtered = computed(() =>
    this.labs().filter(
      (lab) =>
        (!this.labId() || lab.labId === this.labId()) &&
        `${lab.title} ${lab.summary} ${lab.tags.join(' ')}`
          .toLowerCase()
          .includes(this.search().toLowerCase())
    )
  );
  readonly completed = computed(() =>
    this.attempts().filter((a) => a.status === 'completed')
  );
  readonly passed = computed(() =>
    this.completed().filter((a) => a.result?.passed)
  );
  constructor() {
    const navigation = inject(JourneyNavigation);
    const canLeave = () => this.canLeave();
    navigation.canLeave = canLeave;
    this.destroy.onDestroy(() => {
      if (navigation.canLeave === canLeave)
        navigation.canLeave = null;
    });
    const routeState = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      startWith(null),
      map(() => this.route.snapshot),
      distinctUntilChanged()
    );
    combineLatest([
      routeState,
      this.reloads.pipe(startWith(undefined)),
    ])
      .pipe(
        switchMap(([snapshot]) => {
          const params = snapshot.queryParamMap;
          this.directLaunchState.set(
            params.get('launch') === 'direct' &&
              !snapshot.paramMap.get('attemptId')
          );
          if (!this.directLaunch()) this.handledLaunch = null;
          this.returnToState.set(
            workshopReturn(params.get('returnTo'))
          );
          this.workshopNameState.set(
            params.get('workshopName') || 'Your workshops'
          );
          this.labIdState.set(params.get('lab'));
          const id = snapshot.paramMap.get('attemptId');
          this.viewState.set(snapshot.data['view'] ?? 'explore');
          return this.workspace.load(id).pipe(
            tap((data) => {
              const expected =
                data.attempt.status === 'completed'
                  ? 'result'
                  : 'attempt';
              if (this.view() !== expected)
                this.navigateToAttempt(data.attempt, true);
            })
          );
        }),
        takeUntilDestroyed(this.destroy)
      )
      .subscribe();
    this.workspace.outcomes
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe(({ kind, attempt, workshop }) => {
        if (kind === 'start') {
          this.navigateToAttempt(attempt);
        } else if (
          kind === 'submit' &&
          attempt.status === 'completed'
        ) {
          if (workshop && this.returnTo() === workshop) {
            void this.router.navigateByUrl(workshop, {
              replaceUrl: true,
            });
          } else {
            this.navigateToAttempt(attempt, true);
          }
        }
      });
    effect(() => {
      if (
        !this.directLaunch() ||
        this.loading() ||
        this.busy() ||
        this.error()
      )
        return;
      const lab = this.labs().find((l) => l.labId === this.labId());
      if (!lab) return;
      const key = JSON.stringify([lab.labId, this.returnTo()]);
      if (this.handledLaunch === key) return;
      this.handledLaunch = key;
      const active = this.attempts().find(
        (a) => a.labId === lab.labId && a.status === 'in-progress'
      );
      untracked(() =>
        active ? this.open(active) : this.start(lab.labId)
      );
    });
    this.store.refresh();
  }
  refresh() {
    if (!this.canLeave()) return;
    this.handledLaunch = null;
    this.store.refresh();
    this.reloads.next();
  }
  navigate(view: 'explore' | 'history') {
    if (this.busy() || !this.canLeave()) return;
    this.navigatePath([view], {
      view: null,
      attempt: null,
      launch: null,
    });
  }
  returnToWorkshop() {
    const url = this.returnTo();
    if (url && !this.busy() && this.canLeave()) {
      this.leaving = true;
      void this.router
        .navigateByUrl(url)
        .finally(() => (this.leaving = false));
    }
  }
  showAllLabs() {
    if (!this.busy() && this.canLeave())
      this.navigatePath(['explore'], {
        lab: null,
        view: null,
        attempt: null,
        launch: null,
      });
  }
  canLeave() {
    if (this.leaving) return true;
    if (this.busy()) return false;
    return (
      !this.dirty() ||
      this.attempt()?.status === 'completed' ||
      confirm(
        'Your latest changes have not been saved. Leave this lab?'
      )
    );
  }
  open(attempt: LabAttempt) {
    if (this.busy() || !this.canLeave()) return;
    this.navigateToAttempt(attempt);
  }
  private navigateToAttempt(
    attempt: LabAttempt,
    replaceUrl = this.directLaunch()
  ) {
    this.navigatePath(
      [
        attempt.status === 'completed' ? 'results' : 'attempts',
        attempt._id,
      ],
      { view: null, attempt: null, launch: null },
      replaceUrl
    );
  }
  private navigatePath(
    path: string[],
    queryParams: Record<string, null>,
    replaceUrl = false
  ) {
    this.leaving = true;
    void this.router
      .navigate(path, {
        relativeTo: this.route.parent,
        queryParams,
        queryParamsHandling: 'merge',
        replaceUrl,
      })
      .finally(() => (this.leaving = false));
  }
  start(labId: string) {
    if (!this.busy() && this.canLeave()) this.workspace.start(labId);
  }
  save() {
    this.workspace.save();
  }
  submit() {
    this.workspace.submit(this.returnTo());
  }
  setSearch(search: string) {
    this.searchState.set(search);
  }
  edit(code: string) {
    this.workspace.edit(code);
  }
}
