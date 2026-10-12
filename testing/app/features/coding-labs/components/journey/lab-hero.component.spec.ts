import { TestBed } from '@angular/core/testing';
import { LabHeroComponent } from '../../../../../../src/app/features/coding-labs/components/journey/lab-hero.component';

describe('Lab hero composition', () => {
  it('renders learner copy with bubble and test-tube decoration in shared slots', () => {
    const fixture = TestBed.createComponent(LabHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelectorAll('header').length).toBe(1);
    expect(host.querySelector('h1')?.textContent).toContain('Put skills into practice.');
    expect(host.querySelector('h1')?.textContent).toContain('Build what’s next.');
    expect(host.querySelector('p')?.textContent).toContain('write your solution, and turn understanding into progress.');
    expect(host.querySelector('.journey-hero__hero-tags')?.textContent).toContain('At your own pace');
    expect(host.querySelector('.journey-hero__hero-tags')?.textContent).toContain('Feedback that helps');
    const background = host.querySelector('.journey-hero__background')!;
    const art = host.querySelector('.journey-hero__hero-art')!;
    expect(background.querySelectorAll('.lab-backdrop__bubble').length).toBe(40);
    expect(art.querySelectorAll('.lab-art__tube').length).toBe(3);
    expect(art.querySelectorAll('.lab-art__reaction').length).toBe(9);
    expect(background.getAttribute('aria-hidden')).toBe('true');
    expect(art.getAttribute('aria-hidden')).toBe('true');
    expect(host.querySelector('.journey-hero__embers')).toBeNull();
    expect(host.querySelector('.assessment-backdrop__grid')).toBeNull();
    expect(host.querySelector('.lab-hero__art-bars')).toBeNull();
  });

  it('pauses and resumes projected bubbles and artwork with one control', () => {
    const fixture = TestBed.createComponent(LabHeroComponent);
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    const pulses = [...host.querySelectorAll<HTMLElement>('.lab-backdrop__bubble, .lab-art__reaction')];
    const art = host.querySelector<HTMLElement>('ngx-lab-hero-art')!;
    const button = host.querySelector<HTMLButtonElement>('button')!;
    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(getComputedStyle(art).animationPlayState).toBe('running');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.title).toBe('Resume hero animation');
    for (const pulse of pulses) expect(getComputedStyle(pulse).animationPlayState).toBe('paused');
    expect(getComputedStyle(art).animationPlayState).toBe('paused');
    button.click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    for (const pulse of pulses) expect(getComputedStyle(pulse).animationPlayState).toBe('running');
    expect(getComputedStyle(art).animationPlayState).toBe('running');
  });
});
