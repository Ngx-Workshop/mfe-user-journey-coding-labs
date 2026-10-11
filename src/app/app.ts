import { ChangeDetectionStrategy, Component, HostListener, ElementRef, Injector, afterNextRender, computed, effect, inject, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { JourneyViewModel } from './features/coding-labs/pages/journey/journey.view-model';
import { LabHeroComponent } from './features/coding-labs/components/journey/lab-hero.component';
import { LabCatalogComponent } from './features/coding-labs/components/catalog/lab-catalog.component';
import { LabHistoryComponent } from './features/coding-labs/components/history/lab-history.component';
import { LabRunnerComponent } from './features/coding-labs/components/runner/lab-runner.component';
import { LabResultComponent } from './features/coding-labs/components/result/lab-result.component';
@Component({
  selector: 'mfe-user-journey-coding-labs', changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [JourneyViewModel],
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule, LabHeroComponent, LabCatalogComponent, LabHistoryComponent, LabRunnerComponent, LabResultComponent],
  template: `
    <div class="lab-journey__journey">
      @if (vm.view() !== 'attempt') { <ngx-lab-hero /> }
      <nav class="lab-journey__journey-nav" aria-label="Coding lab views"><div>
        <button class="lab-journey__nav-button" [class.lab-journey__nav-button--active]="vm.view() === 'explore'" [attr.aria-current]="vm.view() === 'explore' ? 'page' : null" [disabled]="vm.busy()" (click)="vm.navigate('explore')"><mat-icon>grid_view</mat-icon>Explore labs</button>
        <button class="lab-journey__nav-button" [class.lab-journey__nav-button--active]="vm.view() === 'history'" [attr.aria-current]="vm.view() === 'history' ? 'page' : null" [disabled]="vm.busy()" (click)="vm.navigate('history')"><mat-icon>history</mat-icon>History & progress</button>
      </div><span>{{ vm.completed().length }} completed <i>·</i> {{ vm.passed().length }} passed</span></nav>
      <main #content tabindex="-1" [attr.aria-busy]="vm.loading() || vm.busy() || vm.detailLoading()">
        @if (vm.loading() || vm.detailLoading()) { <div class="lab-journey__loading" role="status"><mat-progress-bar mode="indeterminate" aria-label="Loading coding labs" /><p>Getting your coding journey ready…</p></div> }
        @if (vm.error() || vm.detailError()) { <div class="lab-journey__error" role="alert"><mat-icon>error_outline</mat-icon><div><strong>We couldn’t complete that request</strong><p>{{ vm.error() || vm.detailError() }}</p>
          <button mat-button [disabled]="vm.loading() || vm.busy()" (click)="vm.refresh()">Refresh labs and history</button></div></div> }
        @if (vm.view() === 'attempt') {
          @if (vm.attempt(); as attempt) { @if (attempt.status === 'completed') { <ngx-lab-result [attempt]="attempt" [busy]="vm.busy()" (retry)="vm.start($event)" (back)="vm.navigate('history')" /> } @else if (vm.content(); as content) { @for (item of [attempt]; track item._id) {
            <ngx-lab-runner [attempt]="item" [content]="content" [code]="vm.code()" [busy]="vm.busy()" [dirty]="vm.dirty()" [saved]="vm.saved()"
              (edit)="vm.edit($event)" (save)="vm.save()" (submit)="vm.submit()" (back)="vm.navigate('explore')" />
          } } }
        } @else if (!vm.loading()) {
          @if (vm.view() === 'history') { <ngx-lab-history [attempts]="vm.attempts()" [busy]="vm.busy()" (open)="vm.open($event)" (retry)="vm.start($event)" /> }
          @else { <ngx-lab-catalog [labs]="vm.filtered()" [attempts]="vm.attempts()" [busy]="vm.busy()" [search]="vm.search()" (searchChange)="vm.search.set($event)" (start)="vm.start($event)" /> }
        }
      </main><footer><span>Small steps. Lasting understanding.</span><span>NGX WORKSHOP <span class="lab-journey__footer-dot">✦</span></span></footer>
    </div>
  `,
  styles: [`
:host {
    display: block; min-width: 0; width: 100%; color: var(--ink); --ink: var(--mat-sys-on-surface);
    --muted: var(--mat-sys-on-surface-variant); --panel: var(--mat-sys-surface-container-lowest);
    --soft: var(--mat-sys-surface-container); --line: var(--mat-sys-outline-variant);
    --accent: var(--mat-sys-primary); --primary-soft: var(--mat-sys-primary-container);
    --on-primary-soft: var(--mat-sys-on-primary-container);
    --secondary-soft: var(--mat-sys-secondary-container);
    --on-secondary-soft: var(--mat-sys-on-secondary-container);
    --tertiary-soft: var(--mat-sys-tertiary-container);
    --on-tertiary-soft: var(--mat-sys-on-tertiary-container);
    --error-soft: var(--mat-sys-error-container); --on-error-soft: var(--mat-sys-on-error-container);
    font-family: 'Roboto', sans-serif;
  }
* { box-sizing: border-box; }
.lab-journey__journey { min-height: 100%; }
button { font-family: inherit; cursor: pointer; }
button:disabled { cursor: default; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 4px; }
.lab-journey__journey-nav {
    display: flex; justify-content: space-between; align-items: center; gap: 15px;
    padding: 0 clamp(22px, 5vw, 65px); background: var(--panel); border-bottom: 1px solid var(--line);
  }
.lab-journey__journey-nav > div { display: flex; gap: 28px; }
.lab-journey__journey-nav button {
    display: flex; align-items: center; gap: 8px; padding: 23px 0 20px; border: 0;
    border-bottom: 3px solid transparent; background: none; color: var(--muted); font-size: 12px;
    white-space: nowrap;
  }
.lab-journey__journey-nav button.lab-journey__nav-button--active {
    border-color: var(--accent); color: var(--accent); font-weight: 650;
  }
.lab-journey__journey-nav mat-icon { font-size: 17px; width: 17px; height: 17px; }
.lab-journey__journey-nav > span { font-size: 10px; color: var(--muted); white-space: nowrap; }
.lab-journey__journey-nav i { padding: 0 8px; font-style: normal; }
main { max-width: 1340px; margin: auto; padding: 38px clamp(22px, 5vw, 65px) 50px; }
main:focus { outline: none; }
.lab-journey__back { margin: -15px 0 25px -10px; font-size: 12px; }
.lab-journey__loading { margin: 30px 0; }
.lab-journey__loading p { font-size: 13px; color: var(--muted); }
.lab-journey__error {
    display: flex; gap: 15px; padding: 20px; border-radius: 14px; background: var(--error-soft);
    color: var(--on-error-soft); margin-bottom: 22px; font-size: 13px;
  }
.lab-journey__error p { line-height: 1.5; }
.lab-journey__missing { padding: 40px 0; }
footer {
    border-top: 1px solid var(--line); margin: 0 clamp(22px, 5vw, 65px); padding: 22px 0; display: flex;
    justify-content: space-between; color: var(--muted); font-size: 10px;
  }
footer > span:last-child { font-size: 8px; letter-spacing: 1.5px; }
.lab-journey__footer-dot { padding-left: 10px; font-size: 14px; color: var(--accent); }
@media (max-width: 900px) {
.lab-journey__journey-nav > span { display: none; }
}
@media (max-width: 600px) {
.lab-journey__journey-nav > div { width: 100%; gap: 18px; }
.lab-journey__journey-nav button { font-size: 11px; padding: 18px 0 15px; }
main { padding-top: 30px; }
footer { gap: 18px; line-height: 1.5; }
}  `],
})
export class App {
  readonly vm = inject(JourneyViewModel);
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  private readonly viewKey = computed(() => `${this.vm.view()}/${this.vm.attempt()?._id ?? ''}/${this.vm.attempt()?.status ?? ''}`);
  constructor() {
    const injector = inject(Injector);
    const host = inject<ElementRef<HTMLElement>>(ElementRef);
    effect(() => {
      const key = this.viewKey();
      afterNextRender(() => {
        if (key !== this.viewKey()) return;
        this.content()?.nativeElement.focus({ preventScroll: true });
        (this.vm.view() === 'explore' ? host.nativeElement : this.content()?.nativeElement)?.scrollIntoView({ block: 'start' });
      }, { injector });
    });
  }
  @HostListener('window:beforeunload', ['$event'])
  protectDraft(event: BeforeUnloadEvent) {
    if (this.vm.dirty() && this.vm.attempt()?.status !== 'completed') { event.preventDefault(); event.returnValue = ''; }
  }
}
export default App;
