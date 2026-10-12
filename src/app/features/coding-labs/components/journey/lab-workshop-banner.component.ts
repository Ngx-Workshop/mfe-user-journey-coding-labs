import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-lab-workshop-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <section
      class="lab-journey__workshop"
      aria-label="Workshop activity"
    >
      <div>
        <span>WORKSHOP ACTIVITY</span><strong>{{ name() }}</strong>
        <p>
          Your place in the workshop is kept. After you submit, you’ll
          return to your workshop automatically.
        </p>
      </div>
      <button
        mat-stroked-button
        [disabled]="busy()"
        (click)="returnToWorkshop.emit()"
      >
        <mat-icon>arrow_back</mat-icon>Return to workshop
      </button>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      .lab-journey__workshop {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 20px;
        margin-bottom: 28px;
        border: 1px solid var(--line);
        border-radius: 16px;
        background: var(--primary-soft);
        color: var(--on-primary-soft);
      }
      .lab-journey__workshop span {
        display: block;
        font-size: 10px;
        letter-spacing: 1.5px;
        margin-bottom: 8px;
      }
      .lab-journey__workshop strong {
        display: block;
        overflow-wrap: anywhere;
      }
      .lab-journey__workshop p {
        margin-bottom: 0;
        font-size: 13px;
        line-height: 1.5;
      }
      @media (max-width: 600px) {
        .lab-journey__workshop {
          flex-direction: column;
          align-items: flex-start;
        }
      }
    `,
  ],
})
export class LabWorkshopBannerComponent {
  readonly name = input.required<string>();
  readonly busy = input(false);
  readonly returnToWorkshop = output<void>();
}
