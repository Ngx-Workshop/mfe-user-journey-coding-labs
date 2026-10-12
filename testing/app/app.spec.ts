import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { App } from '../../src/app/app';
import { lab, attempt } from '../fixtures/labs';

describe('Learner coding journey', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('shows published labs, progress counts and local search', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne('/api/coding-labs/published-labs').flush([lab]);
    http
      .expectOne('/api/user-metadata/coding-lab-attempts')
      .flush([attempt]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain(
      'Put skills into practice'
    );
    expect(element.textContent).toContain('Sum an array');
    expect(element.textContent).toContain('Resume lab');
    const search = element.querySelector('input')!;
    search.value = 'Missing';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No matching labs');
  });
  it('shows recoverable failure, refresh and an honest empty state', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('mat-progress-bar')
    ).toBeTruthy();
    http
      .expectOne('/api/user-metadata/coding-lab-attempts')
      .flush([]);
    http
      .expectOne('/api/coding-labs/published-labs')
      .flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[role="alert"]')
    ).toBeTruthy();
    const refresh = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'button'
      )
    ).find((b) => b.textContent?.includes('Refresh labs'))!;
    refresh.click();
    http.expectOne('/api/coding-labs/published-labs').flush([]);
    http
      .expectOne('/api/user-metadata/coding-lab-attempts')
      .flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'New challenges are on their way'
    );
  });
});
