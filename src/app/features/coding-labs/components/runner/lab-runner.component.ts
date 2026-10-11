import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { marked } from 'marked';
import { LabAttempt, PublishedLab } from '../../models/coding-labs.models';
import { LabCodeEditorComponent } from '../editor/lab-code-editor.component';
@Component({
  selector: 'ngx-lab-runner', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, LabCodeEditorComponent],
  template: `
    <button mat-button [disabled]="busy()" (click)="back.emit()"><mat-icon>arrow_back</mat-icon>Back to labs</button>
    <div class="lab-runner__heading"><div><span class="lab-ui__eyebrow">{{ content().language }} · VERSION {{ attempt().versionNumber }}</span><h2>{{ attempt().title }}</h2></div>
      <span class="lab-ui__badge">Your workspace</span></div>
    <div class="lab-runner__workspace">
      <section class="lab-runner__instructions"><span class="lab-ui__eyebrow">THE CHALLENGE</span><div class="lab-runner__markdown" [innerHTML]="prompt()"></div>
        <h3>Sample tests</h3><p>Each test passes one input to <code>{{ content().entryFnName || 'solve' }}</code>.</p>
        @for (test of content().sampleTests; track $index) {
          <div class="lab-runner__sample"><strong>{{ test.name }}</strong><pre>Input: {{ json(test.input) }}
Expected: {{ json(test.expected) }}</pre></div>
        }
        @if (content().hints.length) { <details><summary>Need a hint?</summary>@for (hint of content().hints; track $index) { <p>{{ hint }}</p> }</details> }
      </section>
      <section class="lab-runner__solution"><div class="lab-runner__editor-heading"><h3>Your solution</h3><span>{{ dirty() ? 'Unsaved changes' : saved() ? 'Progress saved' : 'Saved progress' }}</span></div>
        <ngx-lab-code-editor [code]="code()" [language]="content().language" [readOnly]="busy()" (changed)="edit.emit($event)" />
        <p id="lab-editor-help">Use Tab to move to the next control. Return a JSON value; package imports and browser APIs are unavailable.</p>

          <div class="lab-runner__actions"><button mat-button [disabled]="busy() || !dirty()" (click)="save.emit()"><mat-icon>save</mat-icon>Save progress</button>
            <button mat-flat-button [disabled]="busy() || !code().trim()" (click)="submit.emit()"><mat-icon>play_arrow</mat-icon>{{ busy() ? 'Working…' : 'Submit solution' }}</button></div>
          <p>Submitting saves your code and finishes this attempt. You can retry afterward.</p>
      </section>
    </div>
  `,
  styles: [`
    @use '../../styles/shared' as ui;
    @include ui.foundation(('eyebrow', 'badge'));
    .lab-runner__heading { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin: 26px 0; }
    .lab-runner__workspace { display: grid; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); gap: 26px; }
    .lab-runner__instructions, .lab-runner__solution { min-width: 0; padding: 25px; border: 1px solid var(--line); border-radius: 20px; background: var(--panel); }
    .lab-runner__markdown { line-height: 1.75; overflow-wrap: anywhere; margin-bottom: 28px; }
    h3 { margin-bottom: 14px; } p { font-size: 13px; margin-bottom: 15px; } pre { overflow: auto; font-size: 12px; line-height: 1.7; }
    .lab-runner__sample { padding: 15px; margin: 12px 0; background: var(--soft); border-radius: 12px; font-size: 13px; }
    details { padding: 16px 0; } summary { cursor: pointer; font-weight: 600; margin-bottom: 12px; }
    .lab-runner__editor-heading { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; } .lab-runner__editor-heading span { color: var(--muted); font-size: 11px; }
    .lab-runner__actions { display: flex; justify-content: flex-end; gap: 12px; margin: 20px 0; }
    @media (max-width: 900px) { .lab-runner__workspace { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .lab-runner__heading { flex-wrap: wrap; } .lab-runner__solution, .lab-runner__instructions { padding: 18px; } }
  `],
})
export class LabRunnerComponent {
  readonly attempt = input.required<LabAttempt>();
  readonly content = input.required<PublishedLab>();
  readonly code = input.required<string>();
  readonly busy = input(false);
  readonly dirty = input(false);
  readonly saved = input(false);
  readonly prompt = computed(() => marked.parse(this.content().promptMarkdown, { async: false }));
  readonly edit = output<string>();
  readonly save = output<void>();
  readonly submit = output<void>();
  readonly back = output<void>();
  json(value: unknown) { return JSON.stringify(value); }
}
