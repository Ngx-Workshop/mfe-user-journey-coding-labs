import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { LabHeroComponent } from './features/coding-labs/components/journey/lab-hero.component';
import { LabNavigationComponent } from './features/coding-labs/components/journey/lab-navigation.component';
import { LabWorkshopBannerComponent } from './features/coding-labs/components/journey/lab-workshop-banner.component';
import { LabRequestStatusComponent } from './features/coding-labs/components/journey/lab-request-status.component';
import { LabWorkspaceViewModel } from './features/coding-labs/pages/journey/lab-workspace.view-model';
import { JourneyViewModel } from './features/coding-labs/pages/journey/journey.view-model';
import { JourneyContentComponent } from './features/coding-labs/pages/journey/journey-content.component';
@Component({
  selector: 'mfe-user-journey-coding-labs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JourneyViewModel, LabWorkspaceViewModel],
  imports: [
    LabHeroComponent,
    LabNavigationComponent,
    LabWorkshopBannerComponent,
    LabRequestStatusComponent,
    JourneyContentComponent,
  ],
  template: `
    <div class="lab-journey__journey">
      @if (
        vm.view() !== 'attempt' &&
        vm.view() !== 'result' &&
        !vm.directLaunch()
      ) {
        <ngx-lab-hero />
      }
      <ngx-lab-navigation
        [view]="vm.view()"
        [busy]="vm.busy()"
        [completed]="vm.completed().length"
        [passed]="vm.passed().length"
        (navigate)="vm.navigate($event)"
      />
      <main
        #content
        tabindex="-1"
        [attr.aria-busy]="
          vm.loading() || vm.busy() || vm.detailLoading()
        "
      >
        @if (vm.returnTo()) {
          <ngx-lab-workshop-banner
            [name]="vm.workshopName()"
            [busy]="vm.busy()"
            (returnToWorkshop)="vm.returnToWorkshop()"
          />
        }
        <ngx-lab-request-status
          [loading]="
            vm.loading() ||
            vm.detailLoading() ||
            vm.openingAssignment()
          "
          [error]="vm.error() || vm.detailError()"
          [refreshDisabled]="vm.loading() || vm.busy()"
          (refresh)="vm.refresh()"
        />
        <ngx-lab-journey-content />
      </main>
      <footer>
        <span>Small steps. Lasting understanding.</span>
        <span
          >NGX WORKSHOP
          <span class="lab-journey__footer-dot">✦</span></span
        >
      </footer>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        width: 100%;
        color: var(--ink);
        --ink: var(--mat-sys-on-surface);
        --muted: var(--mat-sys-on-surface-variant);
        --panel: var(--mat-sys-surface-container-lowest);
        --soft: var(--mat-sys-surface-container);
        --line: var(--mat-sys-outline-variant);
        --accent: var(--mat-sys-primary);
        --primary-soft: var(--mat-sys-primary-container);
        --on-primary-soft: var(--mat-sys-on-primary-container);
        --secondary-soft: var(--mat-sys-secondary-container);
        --on-secondary-soft: var(--mat-sys-on-secondary-container);
        --tertiary-soft: var(--mat-sys-tertiary-container);
        --on-tertiary-soft: var(--mat-sys-on-tertiary-container);
        --error-soft: var(--mat-sys-error-container);
        --on-error-soft: var(--mat-sys-on-error-container);
        font-family: 'Roboto', sans-serif;
      }
      * {
        box-sizing: border-box;
      }
      .lab-journey__journey {
        min-height: 100%;
      }
      main {
        max-width: 1340px;
        margin: auto;
        padding: 38px clamp(22px, 5vw, 65px) 50px;
      }
      main:focus {
        outline: none;
      }
      footer {
        border-top: 1px solid var(--line);
        margin: 0 clamp(22px, 5vw, 65px);
        padding: 22px 0;
        display: flex;
        justify-content: space-between;
        color: var(--muted);
        font-size: 10px;
      }
      footer > span:last-child {
        font-size: 8px;
        letter-spacing: 1.5px;
      }
      .lab-journey__footer-dot {
        padding-left: 10px;
        font-size: 14px;
        color: var(--accent);
      }
      @media (max-width: 600px) {
        main {
          padding-top: 30px;
        }
        footer {
          gap: 18px;
          line-height: 1.5;
        }
      }
    `,
  ],
})
export class App {
  readonly vm = inject(JourneyViewModel);
  private readonly content =
    viewChild<ElementRef<HTMLElement>>('content');
  private readonly viewKey = computed(
    () =>
      `${this.vm.view()}/${this.vm.attempt()?._id ?? ''}/${this.vm.attempt()?.status ?? ''}`
  );
  constructor() {
    const injector = inject(Injector);
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    effect(() => {
      const key = this.viewKey();
      afterNextRender(
        () => {
          if (key !== this.viewKey()) return;
          this.content()?.nativeElement.focus({
            preventScroll: true,
          });
          (this.vm.view() === 'explore'
            ? host.nativeElement
            : this.content()?.nativeElement
          )?.scrollIntoView({ block: 'start' });
        },
        { injector }
      );
    });
  }
  @HostListener('window:beforeunload', ['$event'])
  protectDraft(event: BeforeUnloadEvent) {
    if (
      this.vm.dirty() &&
      this.vm.attempt()?.status !== 'completed'
    ) {
      event.preventDefault();
      event.returnValue = '';
    }
  }
}
export default App;
