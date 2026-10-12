import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LabView } from '../../models/coding-labs.models';

@Component({
  selector: 'ngx-lab-navigation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <nav
      class="lab-journey__journey-nav"
      aria-label="Coding lab views"
    >
      <div>
        <button
          class="lab-journey__nav-button"
          [class.lab-journey__nav-button--active]="
            view() === 'explore'
          "
          [attr.aria-current]="view() === 'explore' ? 'page' : null"
          [disabled]="busy()"
          (click)="navigate.emit('explore')"
        >
          <mat-icon>grid_view</mat-icon>Explore labs
        </button>
        <button
          class="lab-journey__nav-button"
          [class.lab-journey__nav-button--active]="
            view() === 'history'
          "
          [attr.aria-current]="view() === 'history' ? 'page' : null"
          [disabled]="busy()"
          (click)="navigate.emit('history')"
        >
          <mat-icon>history</mat-icon>History & progress
        </button>
      </div>
      <span
        >{{ completed() }} completed <i>·</i>
        {{ passed() }} passed</span
      >
    </nav>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      button {
        font-family: inherit;
        cursor: pointer;
      }
      button:disabled {
        cursor: default;
      }
      button:focus-visible {
        outline: 3px solid var(--accent);
        outline-offset: 4px;
      }
      .lab-journey__journey-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 15px;
        padding: 0 clamp(22px, 5vw, 65px);
        background: var(--panel);
        border-bottom: 1px solid var(--line);
      }
      .lab-journey__journey-nav > div {
        display: flex;
        gap: 28px;
      }
      .lab-journey__journey-nav button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 23px 0 20px;
        border: 0;
        border-bottom: 3px solid transparent;
        background: none;
        color: var(--muted);
        font-size: 12px;
        white-space: nowrap;
      }
      .lab-journey__journey-nav
        button.lab-journey__nav-button--active {
        border-color: var(--accent);
        color: var(--accent);
        font-weight: 650;
      }
      .lab-journey__journey-nav mat-icon {
        font-size: 17px;
        width: 17px;
        height: 17px;
      }
      .lab-journey__journey-nav > span {
        font-size: 10px;
        color: var(--muted);
        white-space: nowrap;
      }
      .lab-journey__journey-nav i {
        padding: 0 8px;
        font-style: normal;
      }
      @media (max-width: 900px) {
        .lab-journey__journey-nav > span {
          display: none;
        }
      }
      @media (max-width: 600px) {
        .lab-journey__journey-nav > div {
          width: 100%;
          gap: 18px;
        }
        .lab-journey__journey-nav button {
          font-size: 11px;
          padding: 18px 0 15px;
        }
      }
    `,
  ],
})
export class LabNavigationComponent {
  readonly view = input.required<LabView>();
  readonly busy = input(false);
  readonly completed = input(0);
  readonly passed = input(0);
  readonly navigate = output<'explore' | 'history'>();
}
