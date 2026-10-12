import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LabAttempt } from '../../models/coding-labs.models';
@Component({
  selector: 'ngx-lab-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  template: `
    <button mat-button (click)="back.emit()">
      <mat-icon>arrow_back</mat-icon>Back to history
    </button>
    <section class="lab-result__summary">
      <span class="lab-ui__eyebrow">YOUR LAB RESULT</span>
      <h2>
        {{
          attempt().result?.passed
            ? 'You solved it.'
            : 'Keep exploring.'
        }}
      </h2>
      <p>
        {{ attempt().title }} · Version
        {{ attempt().versionNumber }} ·
        {{ attempt().updatedAt | date: 'medium' }}
      </p>
      <div class="lab-result__score">
        <strong
          >{{ attempt().result?.passedTests }} /
          {{ attempt().result?.totalTests }}</strong
        ><span>tests passed</span>
      </div>
      <p>
        {{
          attempt().result?.passed
            ? 'Every test passed. Bring this confidence to your next challenge.'
            : 'Each attempt helps you learn. Revisit your approach and try a fresh solution.'
        }}
      </p>
      <button
        mat-flat-button
        [disabled]="busy()"
        (click)="retry.emit(attempt().labId)"
      >
        <mat-icon>replay</mat-icon>Retry lab
      </button>
      <p class="lab-result__note">
        Retry starts the latest published version, or resumes an
        unfinished attempt. This result stays in your history.
      </p>
    </section>
    <div class="lab-result__details">
      <section class="lab-result__panel">
        <h3>Your submitted solution</h3>
        <pre tabindex="0" aria-label="Submitted solution code">{{
          attempt().code
        }}</pre>
      </section>
      <section class="lab-result__panel">
        <h3>Sample test feedback</h3>
        @for (test of attempt().result?.results || []; track $index) {
          <div class="lab-result__test">
            <strong>{{ test.name }}</strong
            ><span
              class="lab-ui__badge"
              [class.lab-ui__badge--success]="
                test.status === 'passed'
              "
              >{{ test.status }}</span
            >
            @if (test.message) {
              <p>{{ test.message }}</p>
            }
          </div>
        }
        <p>
          Totals include hidden tests. Hidden inputs and expected
          answers remain private.
        </p>
      </section>
    </div>
  `,
  styles: [
    `
      @use '../../styles/shared' as ui;
      @include ui.foundation(('eyebrow', 'badge'));
      .lab-result__summary {
        text-align: center;
        padding: 40px 24px;
        margin: 20px 0 28px;
        background: var(--primary-soft);
        border-radius: 20px;
        color: var(--on-primary-soft);
      }
      .lab-result__summary p {
        margin: 16px auto;
        max-width: 650px;
        color: inherit;
        font-size: 14px;
      }
      .lab-result__score {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 28px 0;
      }
      .lab-result__score strong {
        font-size: 48px;
        letter-spacing: -2px;
      }
      .lab-result__summary .lab-result__note {
        font-size: 12px;
        margin-top: 22px;
      }
      .lab-result__details {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 24px;
      }
      .lab-result__panel {
        min-width: 0;
        border: 1px solid var(--line);
        border-radius: 18px;
        padding: 24px;
        background: var(--panel);
      }
      pre {
        overflow: auto;
        font: 13px/1.7 monospace;
      }
      .lab-result__test {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
        padding: 18px 0;
        border-bottom: 1px solid var(--line);
        font-size: 13px;
      }
      .lab-result__test p {
        flex-basis: 100%;
      }
      .lab-result__panel > p {
        font-size: 12px;
        margin-top: 20px;
      }
      @media (max-width: 750px) {
        .lab-result__details {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class LabResultComponent {
  readonly attempt = input.required<LabAttempt>();
  readonly busy = input(false);
  readonly retry = output<string>();
  readonly back = output<void>();
}
