import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'ngx-lab-request-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  template: `
    @if (loading()) {
      <div class="lab-journey__loading" role="status">
        <mat-progress-bar
          mode="indeterminate"
          aria-label="Loading coding labs"
        />
        <p>Getting your coding journey ready…</p>
      </div>
    }
    @if (error()) {
      <div class="lab-journey__error" role="alert">
        <mat-icon>error_outline</mat-icon>
        <div>
          <strong>We couldn’t complete that request</strong>
          <p>{{ error() }}</p>
          <button
            mat-button
            [disabled]="refreshDisabled()"
            (click)="refresh.emit()"
          >
            Refresh labs and history
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      .lab-journey__loading {
        margin: 30px 0;
      }
      .lab-journey__loading p {
        font-size: 13px;
        color: var(--muted);
      }
      .lab-journey__error {
        display: flex;
        gap: 15px;
        padding: 20px;
        border-radius: 14px;
        background: var(--error-soft);
        color: var(--on-error-soft);
        margin-bottom: 22px;
        font-size: 13px;
      }
      .lab-journey__error p {
        line-height: 1.5;
      }
    `,
  ],
})
export class LabRequestStatusComponent {
  readonly loading = input(false);
  readonly error = input('');
  readonly refreshDisabled = input(false);
  readonly refresh = output<void>();
}
