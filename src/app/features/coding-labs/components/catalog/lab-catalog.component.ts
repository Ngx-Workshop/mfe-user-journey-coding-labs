import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  LabSummary,
  LabAttempt,
} from '../../models/coding-labs.models';
@Component({
  selector: 'ngx-lab-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="lab-ui__section-heading">
      <div>
        <span class="lab-ui__eyebrow">CHOOSE YOUR CHALLENGE</span>
        <h2>What will you build today?</h2>
        <p>
          Put your knowledge into practice, one solution at a time.
        </p>
      </div>
      <span
        >{{ labs().length }}
        {{ labs().length === 1 ? 'lab' : 'labs' }}</span
      >
    </div>
    <label class="lab-catalog__search"
      ><mat-icon>search</mat-icon
      ><input
        type="search"
        aria-label="Search coding labs"
        placeholder="Search labs, topics, or skills"
        [value]="search()"
        (input)="searchChange.emit(inputValue($event))"
    /></label>
    <div class="lab-catalog__grid">
      @for (lab of labs(); track lab.labId) {
        <article class="lab-catalog__card">
          <div class="lab-catalog__top">
            <span class="lab-catalog__mark" aria-hidden="true"
              >&#123; &#125;</span
            >
            <span
              class="lab-ui__badge"
              [class.lab-ui__badge--active]="active(lab.labId)"
              >{{
                active(lab.labId)
                  ? 'In progress'
                  : lab.difficulty || 'Practice'
              }}</span
            >
          </div>
          <h3>{{ lab.title }}</h3>
          <p>
            {{
              lab.summary ||
                'Write a solution, test your thinking, and build confidence.'
            }}
          </p>
          <div class="lab-catalog__tags">
            @for (tag of lab.tags; track tag) {
              <span>{{ tag }}</span>
            }
          </div>
          <div class="lab-catalog__footer">
            <span>{{
              lab.estimatedMinutes
                ? lab.estimatedMinutes + ' min'
                : 'At your pace'
            }}</span>
            <button
              mat-flat-button
              [disabled]="busy()"
              (click)="start.emit(lab.labId)"
            >
              {{ active(lab.labId) ? 'Resume lab' : 'Start lab'
              }}<mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </article>
      } @empty {
        <div class="lab-ui__empty">
          <mat-icon>code</mat-icon>
          <h3>
            {{
              search()
                ? 'No matching labs'
                : 'New challenges are on their way'
            }}
          </h3>
          <p>
            {{
              search()
                ? 'Try another topic or clear your search.'
                : 'Published coding labs will appear here when they are ready.'
            }}
          </p>
        </div>
      }
    </div>
  `,
  styles: [
    `
      @use '../../styles/shared' as ui;
      @include ui.foundation(
        ('section-heading', 'eyebrow', 'badge', 'empty')
      );
      .lab-catalog__search {
        display: flex;
        align-items: center;
        gap: 12px;
        border: 1px solid var(--line);
        border-radius: 12px;
        padding: 12px 16px;
        margin-bottom: 26px;
        max-width: 480px;
        color: var(--muted);
        background: var(--panel);
      }
      input {
        flex: 1;
        min-width: 0;
        border: none;
        background: none;
        color: var(--ink);
        font: inherit;
      }
      .lab-catalog__grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 20px;
      }
      .lab-catalog__card {
        display: flex;
        flex-direction: column;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--panel);
        padding: 25px;
      }
      .lab-catalog__top,
      .lab-catalog__footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .lab-catalog__mark {
        display: grid;
        place-items: center;
        width: 52px;
        height: 58px;
        border-radius: 16px;
        background: var(--primary-soft);
        color: var(--on-primary-soft);
        font: bold 24px monospace;
      }
      h3 {
        margin: 24px 0 12px;
        font-size: 25px;
      }
      p {
        font-size: 13px;
        flex: 1;
      }
      .lab-catalog__tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 22px 0;
        font-size: 11px;
        color: var(--muted);
      }
      .lab-catalog__footer {
        padding-top: 18px;
        border-top: 1px solid var(--line);
        font-size: 12px;
      }
      .lab-ui__empty {
        grid-column: 1 / -1;
      }
      @media (max-width: 1000px) {
        .lab-catalog__grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
      @media (max-width: 650px) {
        .lab-catalog__grid {
          grid-template-columns: 1fr;
        }
        .lab-ui__section-heading {
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class LabCatalogComponent {
  readonly labs = input.required<LabSummary[]>();
  readonly attempts = input.required<LabAttempt[]>();
  readonly search = input('');
  readonly busy = input(false);
  readonly start = output<string>();
  readonly searchChange = output<string>();
  active(id: string) {
    return this.attempts().some(
      (a) => a.labId === id && a.status === 'in-progress'
    );
  }
  inputValue(event: Event) {
    return (event.target as HTMLInputElement).value;
  }
}
