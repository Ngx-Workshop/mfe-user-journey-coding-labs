import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ngx-lab-hero-background',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="lab-backdrop__bubbles">
      @for (bubble of bubbles; track $index) {
        <span
          class="lab-backdrop__bubble"
          [style.left.%]="bubble.left"
          [style.width.px]="bubble.size"
          [style.--lab-bubble-size]="bubble.size + 'px'"
          [style.--lab-bubble-drift]="bubble.drift + 'px'"
          [style.animation-duration.s]="bubble.duration"
          [style.animation-delay.s]="bubble.delay"
        ></span>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: absolute;
      inset: 0;
    }
    .lab-backdrop__bubbles {
      position: absolute;
      inset: 0;
      overflow: hidden;
      mask-image: linear-gradient(to right, transparent 20%, #000 85%);
      background:
        radial-gradient(ellipse at 92% 115%,
          color-mix(in srgb, var(--mat-sys-tertiary) 19%, transparent), transparent 65%),
        radial-gradient(ellipse at 65% 125%,
          color-mix(in srgb, var(--mat-sys-primary) 14%, transparent), transparent 60%);
    }
    .lab-backdrop__bubble {
      position: absolute;
      bottom: -30px;
      height: 100%;
      color: var(--mat-sys-primary);
      animation: lab-bubble-rise linear infinite;
      animation-play-state: var(--ngx-hero-animation-play-state, running);
    }
    .lab-backdrop__bubble::before {
      content: '';
      position: absolute;
      bottom: 0;
      width: 100%;
      height: var(--lab-bubble-size);
      box-sizing: border-box;
      border: 1px solid color-mix(in srgb, currentColor 55%, transparent);
      border-radius: 50%;
      background:
        radial-gradient(circle at 30% 26%, var(--panel) 0 7%, transparent 16%),
        radial-gradient(circle at 65% 75%,
          color-mix(in srgb, currentColor 20%, transparent), transparent 70%);
      box-shadow: inset 0 0 5px color-mix(in srgb, currentColor 15%, transparent);
    }
    .lab-backdrop__bubble:nth-child(3n) { color: var(--mat-sys-tertiary); }
    .lab-backdrop__bubble:nth-child(3n + 1) { color: var(--mat-sys-secondary); }
    @keyframes lab-bubble-rise {
      0% { transform: translate3d(0, 0, 0); opacity: 0; }
      15% { opacity: 0.5; }
      40% { transform: translate3d(var(--lab-bubble-drift), -40%, 0); }
      70% { transform: translate3d(calc(var(--lab-bubble-drift) * -0.4), -70%, 0); opacity: 0.4; }
      100% { transform: translate3d(var(--lab-bubble-drift), -115%, 0); opacity: 0; }
    }
    @media (max-width: 600px) {
      .lab-backdrop__bubble:nth-child(n + 25) { display: none; }
    }
    @media (prefers-reduced-motion: reduce) {
      .lab-backdrop__bubble { animation: none; }
    }
  `,
})
export class LabHeroBackgroundComponent {
  readonly bubbles = Array.from({ length: 40 }, (_, index) => ({
    left: 20 + ((index * 37) % 80),
    size: 8 + (index * 7) % 21,
    drift: ((index * 11) % 41) - 20,
    duration: 6 + ((index * 7) % 30) / 10,
    delay: -((index * 17) % 89) / 10,
  }));
}
