import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-lab-hero-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="lab-hero__hero-art" aria-hidden="true">
      <div class="lab-hero__orb lab-hero__orb--one"></div>
      <div class="lab-hero__orb lab-hero__orb--two"></div>
      <span class="lab-hero__spark lab-hero__spark--one">✦</span
      ><span class="lab-hero__spark lab-hero__spark--two">✧</span>
      <div class="lab-hero__art-card">
        <div class="lab-hero__art-icon">
          <mat-icon>code</mat-icon>
        </div>
        <span>YOUR NEXT CHAPTER</span>
        <div class="lab-hero__art-bars">
          <i></i><i></i><i></i><i></i><i></i>
        </div>
        <div class="lab-hero__art-line"></div>
        <div
          class="lab-hero__art-line lab-hero__art-line--short"
        ></div>
      </div>
      <div class="lab-hero__art-check">
        <mat-icon>check</mat-icon>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      * {
        box-sizing: border-box;
      }
      .lab-hero__hero-art {
        position: relative;
        display: grid;
        place-items: center;
        min-height: 240px;
      }
      .lab-hero__orb {
        position: absolute;
        border-radius: 50%;
      }
      .lab-hero__orb--one {
        background: var(--primary-soft);
        width: 210px;
        height: 210px;
        right: 0;
        top: 32px;
      }
      .lab-hero__orb--two {
        border: 1px solid var(--line);
        width: 235px;
        height: 235px;
        left: 0;
        top: 5px;
      }
      .lab-hero__art-card {
        position: relative;
        width: 156px;
        height: 187px;
        background: var(--panel);
        box-shadow: 0 16px 28px
          color-mix(in srgb, var(--mat-sys-shadow) 12%, transparent);
        border-radius: 15px;
        padding: 19px;
        transform: rotate(-9deg);
      }
      .lab-hero__art-icon {
        width: 32px;
        height: 32px;
        display: grid;
        place-items: center;
        border-radius: 9px;
        background: var(--primary-soft);
        color: var(--on-primary-soft);
        margin-bottom: 13px;
      }
      .lab-hero__art-card > span {
        font-size: 6px;
        letter-spacing: 1px;
        color: var(--muted);
      }
      .lab-hero__art-bars {
        display: flex;
        align-items: flex-end;
        gap: 7px;
        height: 50px;
        margin: 12px 0;
      }
      .lab-hero__art-bars i {
        width: 18px;
        background: var(--primary-soft);
        border-radius: 4px 4px 0 0;
        height: 25%;
      }
      .lab-hero__art-bars i:nth-child(2) {
        height: 44%;
      }
      .lab-hero__art-bars i:nth-child(3) {
        height: 58%;
        background: color-mix(
          in srgb,
          var(--accent) 40%,
          var(--primary-soft)
        );
      }
      .lab-hero__art-bars i:nth-child(4) {
        height: 76%;
        background: color-mix(
          in srgb,
          var(--accent) 70%,
          var(--primary-soft)
        );
      }
      .lab-hero__art-bars i:nth-child(5) {
        height: 100%;
        background: var(--accent);
      }
      .lab-hero__art-line {
        height: 4px;
        border-radius: 4px;
        background: var(--soft);
        width: 100%;
        margin-top: 7px;
      }
      .lab-hero__art-line.lab-hero__art-line--short {
        width: 65%;
      }
      .lab-hero__art-check {
        position: absolute;
        bottom: 40px;
        right: 20px;
        width: 44px;
        height: 44px;
        display: grid;
        place-items: center;
        background: var(--accent);
        color: var(--mat-sys-on-primary);
        border: 5px solid var(--line);
        border-radius: 50%;
      }
      .lab-hero__spark {
        position: absolute;
        color: var(--accent);
      }
      .lab-hero__spark--one {
        top: 10px;
        right: 35px;
        font-size: 28px;
      }
      .lab-hero__spark--two {
        bottom: 22px;
        left: 15px;
        font-size: 33px;
      }
    `,
  ],
})
export class LabHeroArtComponent {}
