import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { LabHeroArtComponent } from './lab-hero-art.component';

@Component({
  selector: 'ngx-lab-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, LabHeroArtComponent],
  template: `
    <header class="lab-hero__hero">
      <div class="lab-hero__hero-copy">
        <div class="lab-hero__hero-kicker">
          <span></span>THE CODING STUDIO
        </div>
        <h1>
          Put skills into practice.<br /><em>Build what’s next.</em>
        </h1>
        <p>
          A little curiosity goes a long way. Take on a challenge,<br
            class="lab-hero__desktop-break"
          />
          write your solution, and turn understanding into progress.
        </p>
        <div class="lab-hero__hero-tags">
          <span><mat-icon>schedule</mat-icon>At your own pace</span
          ><span
            ><mat-icon>insights</mat-icon>Feedback that helps</span
          >
        </div>
      </div>
      <ngx-lab-hero-art aria-hidden="true" />
    </header>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      .lab-hero__hero {
        padding: 45px clamp(22px, 5vw, 65px);
        display: grid;
        grid-template-columns: minmax(0, 1fr) 260px;
        gap: 35px;
        overflow: hidden;
        background: var(--soft);
        border-bottom: 1px solid var(--line);
      }
      .lab-hero__hero-kicker {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 9px;
        font-weight: 750;
        letter-spacing: 2.5px;
        color: var(--muted);
      }
      .lab-hero__hero-kicker > span {
        width: 6px;
        height: 6px;
        background: var(--soft);
        border-radius: 50%;
      }
      h1 {
        font-size: clamp(32px, 4.5vw, 53px);
        font-weight: 500;
        letter-spacing: -2px;
        line-height: 1.13;
        margin: 23px 0 20px;
      }
      h1 em {
        font-family: Georgia, serif;
        font-weight: 400;
        color: var(--accent);
      }
      .lab-hero__hero-copy p {
        color: var(--muted);
        font-size: 13px;
        line-height: 1.8;
        margin: 0;
      }
      .lab-hero__hero-tags {
        display: flex;
        gap: 25px;
        margin-top: 23px;
        color: var(--muted);
        font-size: 10px;
      }
      .lab-hero__hero-tags span {
        display: flex;
        gap: 6px;
        align-items: center;
      }
      .lab-hero__hero-tags mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      @media (max-width: 900px) {
        .lab-hero__hero {
          grid-template-columns: minmax(0, 1fr) 190px;
          gap: 20px;
          padding-top: 32px;
          padding-bottom: 32px;
        }
        ngx-lab-hero-art {
          transform: scale(0.8);
          transform-origin: center;
        }
      }
      @media (max-width: 600px) {
        .lab-hero__hero {
          grid-template-columns: 1fr;
          gap: 0;
        }
        ngx-lab-hero-art {
          display: none;
        }
        h1 {
          font-size: 36px;
        }
        .lab-hero__hero-tags {
          gap: 15px;
        }
        .lab-hero__desktop-break {
          display: none;
        }
        .lab-hero__hero-copy p {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class LabHeroComponent {}
