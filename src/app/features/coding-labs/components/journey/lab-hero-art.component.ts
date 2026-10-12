import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ngx-lab-hero-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <div class="lab-art__halo"></div>
    <span class="lab-art__formula">&#123; experiment &#125;</span>
    <div class="lab-art__tubes">
      @for (fill of fills; track $index) {
        <div class="lab-art__tube">
          <span class="lab-art__rim"></span>
          <div class="lab-art__glass">
            <div class="lab-art__liquid" [style.height.%]="fill">
              <i class="lab-art__reaction"></i>
              <i class="lab-art__reaction"></i>
              <i class="lab-art__reaction"></i>
            </div>
            <span class="lab-art__shine"></span>
            <span class="lab-art__markings"></span>
          </div>
        </div>
      }
    </div>
    <div class="lab-art__rack">
      <span></span><span></span>
    </div>
    <div class="lab-art__badge"><mat-icon>science</mat-icon></div>
    <span class="lab-art__spark">✧</span>
  `,
  styles: `
    :host {
      position: relative;
      display: grid;
      place-items: center;
      width: 260px;
      min-height: 240px;
      animation: lab-glass-sway 8s ease-in-out infinite;
      animation-play-state: var(--ngx-hero-animation-play-state, running);
    }
    * { box-sizing: border-box; }
    .lab-art__halo {
      position: absolute;
      width: 218px;
      height: 218px;
      border: 1px dashed var(--line);
      border-radius: 50%;
      background: radial-gradient(circle, var(--primary-soft), transparent 70%);
    }
    .lab-art__formula {
      position: absolute;
      top: 5px;
      left: 36px;
      font-family: monospace;
      font-size: 10px;
      color: var(--muted);
      transform: rotate(-8deg);
    }
    .lab-art__tubes {
      position: absolute;
      top: 37px;
      display: flex;
      gap: 20px;
      align-items: flex-start;
      transform: rotate(-5deg);
    }
    .lab-art__tube {
      position: relative;
      width: 42px;
      height: 150px;
      color: var(--mat-sys-primary);
    }
    .lab-art__tube:nth-child(2) { color: var(--mat-sys-tertiary); }
    .lab-art__tube:nth-child(3) { color: var(--mat-sys-secondary); }
    .lab-art__glass {
      position: absolute;
      inset: 5px 0 0;
      overflow: hidden;
      border: 2px solid color-mix(in srgb, var(--muted) 35%, var(--panel));
      border-top: none;
      border-radius: 0 0 22px 22px;
      background: color-mix(in srgb, var(--panel) 70%, transparent);
      box-shadow: 4px 8px 12px color-mix(in srgb, var(--mat-sys-shadow) 8%, transparent);
    }
    .lab-art__rim {
      position: absolute;
      top: 0;
      left: -3px;
      z-index: 1;
      width: 48px;
      height: 8px;
      border: 2px solid color-mix(in srgb, var(--muted) 40%, var(--panel));
      border-radius: 50%;
      background: var(--panel);
    }
    .lab-art__liquid {
      position: absolute;
      bottom: 0;
      width: 100%;
      background: color-mix(in srgb, currentColor 55%, var(--panel));
      border-top: 3px solid color-mix(in srgb, currentColor 30%, var(--panel));
    }
    .lab-art__shine {
      position: absolute;
      top: 12px;
      bottom: 18px;
      left: 6px;
      width: 4px;
      border-radius: 4px;
      background: color-mix(in srgb, var(--panel) 80%, transparent);
    }
    .lab-art__markings {
      position: absolute;
      top: 24px;
      right: 3px;
      width: 8px;
      height: 60px;
      background: repeating-linear-gradient(to bottom,
        var(--muted) 0 1px, transparent 1px 12px);
      opacity: 0.45;
    }
    .lab-art__reaction {
      position: absolute;
      bottom: 6px;
      left: 14px;
      width: 5px;
      height: 5px;
      border: 1px solid var(--panel);
      border-radius: 50%;
      animation: lab-reaction-rise 3s ease-in infinite;
      animation-play-state: var(--ngx-hero-animation-play-state, running);
    }
    .lab-art__reaction:nth-child(2) { left: 24px; animation-delay: -1s; }
    .lab-art__reaction:nth-child(3) { left: 9px; animation-delay: -2s; }
    .lab-art__rack {
      position: absolute;
      bottom: 46px;
      width: 204px;
      height: 13px;
      border: 1px solid var(--line);
      border-radius: 5px;
      background: var(--primary-soft);
      transform: rotate(-5deg);
    }
    .lab-art__rack > span {
      position: absolute;
      top: 11px;
      left: 10px;
      width: 8px;
      height: 22px;
      border-radius: 0 0 3px 3px;
      background: var(--primary-soft);
      border: 1px solid var(--line);
    }
    .lab-art__rack > span:last-child { left: auto; right: 10px; }
    .lab-art__badge {
      position: absolute;
      bottom: 18px;
      right: 2px;
      display: grid;
      place-items: center;
      width: 50px;
      height: 50px;
      border: 5px solid var(--soft);
      border-radius: 50%;
      background: var(--accent);
      color: var(--mat-sys-on-primary);
    }
    .lab-art__spark { position: absolute; top: 17px; right: 6px; color: var(--accent); font-size: 25px; }
    @keyframes lab-glass-sway {
      0%, 100% { translate: -2px 2px; }
      50% { translate: 2px -4px; }
    }
    @keyframes lab-reaction-rise {
      0% { transform: translateY(0); opacity: 0; }
      25% { opacity: 0.8; }
      100% { transform: translateY(-38px); opacity: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      :host, .lab-art__reaction { animation: none; }
    }
  `,
})
export class LabHeroArtComponent {
  readonly fills = [48, 65, 38];
}
