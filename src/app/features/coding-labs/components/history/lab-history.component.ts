import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LabAttempt } from '../../models/coding-labs.models';
@Component({
  selector: 'ngx-lab-history', changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, MatButtonModule, MatIconModule],
  template: `
    <div class="lab-ui__section-heading"><div><span class="lab-ui__eyebrow">YOUR LEARNING RECORD</span>
      <h2>Every attempt. A step forward.</h2><p>Revisit your solutions and give a challenge another try.</p></div><span>{{ attempts().length }} attempts</span></div>
    <div class="lab-history__list">
      @for (attempt of attempts(); track attempt._id) {
        <article class="lab-history__row">
          <span class="lab-ui__mini-mark" aria-hidden="true">&#123; &#125;</span>
          <div class="lab-ui__row-title"><strong>{{ attempt.title }}</strong><span>Version {{ attempt.versionNumber }} · {{ attempt.updatedAt | date: 'medium' }}</span></div>
          @if (attempt.result; as result) { <strong>{{ result.passedTests }}/{{ result.totalTests }}</strong> }
          <span class="lab-ui__badge" [class.lab-ui__badge--success]="attempt.result?.passed">{{ attempt.status === 'in-progress' ? 'In progress' : attempt.result?.passed ? 'Passed' : 'Needs practice' }}</span>
          <button mat-button [disabled]="busy()" (click)="open.emit(attempt)">{{ attempt.status === 'in-progress' ? 'Resume' : 'View result' }}</button>
          @if (attempt.status === 'completed') { <button mat-button [disabled]="busy()" (click)="retry.emit(attempt.labId)"><mat-icon>replay</mat-icon>Retry lab</button> }
        </article>
      } @empty {
        <div class="lab-ui__empty"><mat-icon>history</mat-icon><h3>Your story starts with one lab</h3><p>Your saved attempts and results will appear here.</p></div>
      }
    </div>
  `,
  styles: [`
    @use '../../styles/shared' as ui;
    @include ui.foundation(('section-heading', 'eyebrow', 'badge', 'empty', 'mini-mark', 'row-title'));
    .lab-history__list { display: grid; gap: 12px; }
    .lab-history__row { display: flex; align-items: center; gap: 18px; padding: 21px; border: 1px solid var(--line); border-radius: 14px; background: var(--panel); }
    @media (max-width: 850px) { .lab-history__row { flex-wrap: wrap; gap: 12px; } .lab-ui__row-title { flex-basis: calc(100% - 55px); } }
  `],
})
export class LabHistoryComponent {
  readonly attempts = input.required<LabAttempt[]>();
  readonly busy = input(false);
  readonly open = output<LabAttempt>();
  readonly retry = output<string>();
}
