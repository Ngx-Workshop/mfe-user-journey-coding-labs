import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxHero, NgxJourneyHeroTag } from '@tmdjr/ngx-shared-headers';
import { LabHeroArtComponent } from './lab-hero-art.component';
import { LabHeroBackgroundComponent } from './lab-hero-background.component';

@Component({
  selector: 'ngx-lab-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgxHero, LabHeroArtComponent, LabHeroBackgroundComponent],
  template: `
    <ngx-hero
      kicker="THE CODING STUDIO"
      title="Put skills into practice."
      subtitle="Build what’s next."
      description="A little curiosity goes a long way. Take on a challenge,"
      descriptionContinuation="write your solution, and turn understanding into progress."
      [tags]="tags"
    >
      <ngx-lab-hero-background heroBackground />
      <ngx-lab-hero-art heroArt />
    </ngx-hero>
  `,
  styles: `
    :host {
      display: block;
      --ngx-hero-ink: var(--ink);
      --ngx-hero-soft: var(--soft);
      --ngx-hero-panel: var(--panel);
      --ngx-hero-line: var(--line);
      --ngx-hero-muted: var(--muted);
      --ngx-hero-accent: var(--accent);
      --ngx-hero-primary-soft: var(--primary-soft);
      --ngx-hero-on-primary-soft: var(--on-primary-soft);
    }
  `,
})
export class LabHeroComponent {
  readonly tags: readonly NgxJourneyHeroTag[] = [
    { icon: 'schedule', label: 'At your own pace' },
    { icon: 'insights', label: 'Feedback that helps' },
  ];
}
