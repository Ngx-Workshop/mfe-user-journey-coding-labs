import { Location } from '@angular/common';
import { provideLocationMocks } from '@angular/common/testing';
import { filter, firstValueFrom } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationCancel, Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import App from '../../src/app/app';
import { Routes } from '../../src/app/app.routes';
import { attempt, content, lab } from '../fixtures/labs';

describe('Coding lab routes under a host mount', () => {
  let http: HttpTestingController;
  let router: Router;
  let harness: RouterTestingHarness;
  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [
      provideRouter([{ path: 'coding-labs', children: Routes }, { path: 'outside', children: [] }]),
      provideLocationMocks(), provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(),
    ] });
    http = TestBed.inject(HttpTestingController); router = TestBed.inject(Router);
    router.setUpLocationChangeListener();
    harness = await RouterTestingHarness.create();
  });
  afterEach(() => http.verify());
  function catalog() {
    http.match('/api/coding-labs/published-labs').forEach(r => r.flush([lab]));
    http.match('/api/user-metadata/coding-lab-attempts').forEach(r => r.flush([attempt]));
  }
  function detail(completed = false, id = attempt._id) {
    http.expectOne('/api/user-metadata/coding-lab-attempts/' + id).flush({ ...attempt, _id: id, status: completed ? 'completed' : 'in-progress' });
    if (!completed) http.expectOne('/api/coding-labs/published-labs/abc?versionId=version').flush(content);
  }
  async function settled() { await harness.fixture.whenStable(); harness.detectChanges(); }

  it('defaults to explore, supports history and recovers unknown local paths', async () => {
    await harness.navigateByUrl('/coding-labs'); catalog(); await settled();
    expect(router.url).toBe('/coding-labs/explore');
    expect(harness.routeNativeElement?.textContent).toContain('Sum an array');
    await harness.navigateByUrl('/coding-labs/history'); catalog(); await settled();
    expect(harness.routeNativeElement?.textContent).toContain('History & progress');
    await harness.navigateByUrl('/coding-labs/unknown'); catalog(); await settled();
    expect(router.url).toBe('/coding-labs/explore');
  });
  it('migrates legacy history and attempt links while preserving workshop context', async () => {
    await harness.navigateByUrl('/coding-labs/hello-world?view=history&lab=abc&workshopName=Components');
    catalog(); await settled();
    expect(router.url).toBe('/coding-labs/history?lab=abc&workshopName=Components');
    await harness.navigateByUrl('/coding-labs/hello-world?attempt=attempt&returnTo=%2Fworkshops%2Foverview');
    detail(); catalog(); await settled();
    expect(router.url).toBe('/coding-labs/attempts/attempt?returnTo=%2Fworkshops%2Foverview');
    expect(harness.routeNativeElement?.querySelector('ngx-lab-runner')).toBeTruthy();
  });
  it('uses canonical result routes for completed attempts and workspace routes for unfinished results', async () => {
    await harness.navigateByUrl('/coding-labs/attempts/attempt'); detail(true); catalog(); await settled();
    expect(router.url).toBe('/coding-labs/results/attempt');
    detail(true); catalog(); await settled();
    expect(harness.routeNativeElement?.querySelector('ngx-lab-result')).toBeTruthy();
    await harness.navigateByUrl('/coding-labs/results/other'); detail(false, 'other'); catalog(); await settled();
    expect(router.url).toBe('/coding-labs/attempts/other');
    detail(false, 'other'); catalog(); await settled();
    expect(harness.routeNativeElement?.querySelector('ngx-lab-runner')).toBeTruthy();
  });
  it('protects dirty route exits and same-route attempt parameter navigation', async () => {
    const app = await harness.navigateByUrl('/coding-labs/attempts/attempt', App);
    detail(); catalog(); await settled(); app.vm.edit('unsaved');
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    await harness.navigateByUrl('/coding-labs/history');
    expect(router.url).toBe('/coding-labs/attempts/attempt');
    await harness.navigateByUrl('/coding-labs/attempts/other');
    expect(router.url).toBe('/coding-labs/attempts/attempt');
    confirm.and.returnValue(true); app.vm.navigate('history'); await settled(); catalog(); await settled();
    expect(router.url).toBe('/coding-labs/history'); expect(confirm).toHaveBeenCalledTimes(3);
  });
  it('submits to a result path and retains context without a workshop return destination', async () => {
    const app = await harness.navigateByUrl('/coding-labs/attempts/attempt?workshopName=Components', App);
    detail(); catalog(); await settled(); app.vm.submit();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit').flush({ ...attempt, status: 'completed' });
    await settled();
    expect(router.url).toBe('/coding-labs/results/attempt?workshopName=Components');
    detail(true); catalog(); await settled();
  });
  it('protects browser Back and blocks route exits while saving', async () => {
    await harness.navigateByUrl('/coding-labs/history'); catalog(); await settled();
    const app = await harness.navigateByUrl('/coding-labs/attempts/attempt', App);
    detail(); catalog(); await settled(); app.vm.edit('draft');
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    const cancelled = firstValueFrom(router.events.pipe(filter(event => event instanceof NavigationCancel)));
    TestBed.inject(Location).back(); await cancelled; await settled();
    expect(router.url).toBe('/coding-labs/attempts/attempt');
    expect(app.vm.code()).toBe('draft'); expect(confirmation).toHaveBeenCalledTimes(1);
    app.vm.save();
    await harness.navigateByUrl('/outside');
    expect(router.url).toBe('/coding-labs/attempts/attempt');
    expect(confirmation).toHaveBeenCalledTimes(1);
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({ ...attempt, code: 'draft', revision: 1 });
    await harness.navigateByUrl('/coding-labs/history'); catalog(); await settled();
    expect(router.url).toBe('/coding-labs/history');
  });
  it('starts a direct workshop assignment and removes launch on the workspace route', async () => {
    await harness.navigateByUrl('/coding-labs/explore?lab=abc&launch=direct&returnTo=%2Fworkshops%2Foverview&workshopName=Components');
    http.expectOne('/api/coding-labs/published-labs').flush([lab]);
    http.expectOne('/api/user-metadata/coding-lab-attempts').flush([]); await settled();
    const start = http.expectOne(request => request.method === 'POST');
    expect(start.request.body.labId).toBe('abc'); start.flush(attempt); await settled();
    expect(router.url).toBe('/coding-labs/attempts/attempt?lab=abc&returnTo=%2Fworkshops%2Foverview&workshopName=Components');
    detail(); catalog(); await settled();
    expect(harness.routeNativeElement?.querySelector('ngx-lab-runner')).toBeTruthy();
  });
  it('keeps an unavailable attempt on its route with a recoverable error', async () => {
    await harness.navigateByUrl('/coding-labs/attempts/missing');
    http.expectOne('/api/user-metadata/coding-lab-attempts/missing').flush({}, { status: 404, statusText: 'Not Found' });
    catalog(); await settled();
    expect(router.url).toBe('/coding-labs/attempts/missing');
    expect(harness.routeNativeElement?.querySelector('[role="alert"]')).toBeTruthy();
  });
});
