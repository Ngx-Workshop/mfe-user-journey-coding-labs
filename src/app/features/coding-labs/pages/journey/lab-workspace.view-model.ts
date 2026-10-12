import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Subject,
  catchError,
  defer,
  exhaustMap,
  finalize,
  tap,
} from 'rxjs';
import { CodingLabsStore } from '../../state/coding-labs.store';
import {
  LabAttempt,
  PublishedLab,
} from '../../models/coding-labs.models';
import { labError } from '../../utils/lab-error';

type Command =
  | { kind: 'start'; labId: string }
  | { kind: 'save' | 'submit'; workshop: string | null };
interface WorkspaceOutcome {
  kind: Command['kind'];
  attempt: LabAttempt;
  workshop: string | null;
}

/** Scoped to one journey. Drafts never enter singleton or browser storage. */
@Injectable()
export class LabWorkspaceViewModel {
  private readonly store = inject(CodingLabsStore);
  private readonly drafts = new Map<string, string>();
  private readonly commands = new Subject<Command>();
  private readonly outcomeEvents = new Subject<WorkspaceOutcome>();
  readonly outcomes = this.outcomeEvents.asObservable();
  private readonly attemptState = signal<LabAttempt | null>(null);
  readonly attempt = this.attemptState.asReadonly();
  private readonly contentState = signal<PublishedLab | null>(null);
  readonly content = this.contentState.asReadonly();
  private readonly codeState = signal('');
  readonly code = this.codeState.asReadonly();
  private readonly savedState = signal(false);
  readonly saved = this.savedState.asReadonly();
  private readonly detailErrorState = signal('');
  readonly detailError = this.detailErrorState.asReadonly();
  private readonly detailLoadingState = signal(false);
  readonly detailLoading = this.detailLoadingState.asReadonly();
  readonly dirty = computed(() => {
    const attempt = this.attempt();
    return (
      !!attempt &&
      attempt.status !== 'completed' &&
      this.code() !== attempt.code
    );
  });

  constructor() {
    this.commands
      .pipe(
        exhaustMap((command) => {
          if (this.store.busy()) return EMPTY;
          if (command.kind === 'start') {
            return this.store
              .start({
                labId: command.labId,
                requestId: crypto.randomUUID(),
              })
              .pipe(
                tap((attempt) => {
                  if (attempt)
                    this.outcomeEvents.next({
                      kind: 'start',
                      attempt,
                      workshop: null,
                    });
                })
              );
          }
          const attempt = this.attempt();
          if (!attempt || attempt.status === 'completed')
            return EMPTY;
          const request =
            command.kind === 'submit'
              ? this.store.saveAndSubmit(attempt, this.code())
              : this.store.save(attempt._id, {
                  code: this.code(),
                  revision: attempt.revision,
                });
          return request.pipe(
            tap((progress) => {
              if (!progress || this.attempt()?._id !== progress._id)
                return;
              this.attemptState.set(progress);
              this.drafts.delete(progress._id);
              this.savedState.set(true);
              this.outcomeEvents.next({
                kind: command.kind,
                attempt: progress,
                workshop: command.workshop,
              });
            })
          );
        }),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe();
  }

  /** The journey's switchMap owns replacement/cancellation of this read. */
  load(id: string | null) {
    return defer(() => {
      const previous = this.attempt();
      if (previous && this.dirty())
        this.drafts.set(previous._id, this.code());
      this.attemptState.set(null);
      this.contentState.set(null);
      this.detailErrorState.set('');
      this.savedState.set(false);
      this.detailLoadingState.set(!!id);
      if (!id) return EMPTY;
      return this.store.loadAttempt(id).pipe(
        tap(({ attempt, content }) => {
          this.attemptState.set(attempt);
          this.contentState.set(content);
          this.codeState.set(
            this.drafts.get(attempt._id) ?? attempt.code
          );
        }),
        catchError((error) => {
          this.detailErrorState.set(labError(error));
          return EMPTY;
        }),
        finalize(() => this.detailLoadingState.set(false))
      );
    });
  }

  start(labId: string) {
    this.commands.next({ kind: 'start', labId });
  }
  save() {
    this.commands.next({ kind: 'save', workshop: null });
  }
  submit(workshop: string | null) {
    this.commands.next({ kind: 'submit', workshop });
  }
  edit(code: string) {
    this.codeState.set(code);
    this.savedState.set(false);
  }
}
