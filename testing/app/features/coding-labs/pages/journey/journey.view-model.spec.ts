import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject, map } from 'rxjs';
import { JourneyViewModel } from '../../../../../../src/app/features/coding-labs/pages/journey/journey.view-model';
import { attempt, content, lab } from '../../../../../fixtures/labs';
describe('Coding journey commands', () => {
  let http: HttpTestingController;
  let vm: JourneyViewModel;
  let route: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    route = new BehaviorSubject(convertToParamMap({ attempt: attempt._id }));
    TestBed.configureTestingModule({ providers: [JourneyViewModel, provideHttpClient(), provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { get snapshot() { return {
        queryParamMap: route.value,
        paramMap: convertToParamMap({ attemptId: route.value.get('attempt') ?? '' }),
        data: { view: route.value.get('attempt') ? 'attempt' : route.value.get('view') === 'history' ? 'history' : 'explore' },
      }; } } },
      { provide: Router, useValue: { events: route.pipe(map(() => new NavigationEnd(1, '/', '/'))), navigate: jasmine.createSpy('navigate').and.resolveTo(true), navigateByUrl: jasmine.createSpy('navigateByUrl').and.resolveTo(true) } }] });
    http = TestBed.inject(HttpTestingController); vm = TestBed.inject(JourneyViewModel);
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush(attempt);
    http.expectOne('/api/coding-labs/published-labs/abc?versionId=version').flush(content);
    http.expectOne('/api/coding-labs/published-labs').flush([lab]);
    http.expectOne('/api/user-metadata/coding-lab-attempts').flush([attempt]);
  });
  afterEach(() => http.verify());
  it('preserves edited code and releases busy after a failed save', () => {
    vm.edit('edited solution'); vm.save();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({}, { status: 503, statusText: 'Offline' });
    expect(vm.code()).toBe('edited solution'); expect(vm.dirty()).toBeTrue(); expect(vm.busy()).toBeFalse();
  });
  it('ignores duplicate starts and save commands while a write is active', () => {
    vm.edit('edited'); vm.save(); vm.save(); vm.start('abc');
    const request = http.expectOne('/api/user-metadata/coding-lab-attempts/attempt');
    http.expectNone('/api/user-metadata/coding-lab-attempts');
    request.flush({ ...attempt, code: 'edited', revision: 1 });
    expect(vm.dirty()).toBeFalse();
  });
  it('saves edited code before grading and uses the returned revision', () => {
    vm.edit('solution'); vm.submit();
    const save = http.expectOne('/api/user-metadata/coding-lab-attempts/attempt');
    expect(save.request.body).toEqual({ code: 'solution', revision: 0 });
    save.flush({ ...attempt, code: 'solution', revision: 1 });
    const submit = http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit');
    expect(submit.request.body).toEqual({ code: 'solution', revision: 1 }); expect(vm.busy()).toBeTrue();
    submit.flush({ ...attempt, code: 'solution', revision: 2, status: 'completed', result: { passed: true, passedTests: 2, totalTests: 2, durationMs: 10, results: [] } });
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    expect(vm.completed().length).toBe(1); expect(vm.busy()).toBeFalse(); expect(vm.attempt()?.status).toBe('completed');
  });
  it('does not grade after the prerequisite save fails', () => {
    vm.edit('solution'); vm.submit();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({}, { status: 409, statusText: 'Conflict' });
    http.expectNone('/api/user-metadata/coding-lab-attempts/attempt/submit'); expect(vm.code()).toBe('solution');
  });
  it('keeps saved progress ready for retry if the runner is unavailable', () => {
    vm.edit('solution'); vm.submit();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({ ...attempt, code: 'solution', revision: 1 });
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit').flush({}, { status: 503, statusText: 'Offline' });
    expect(vm.attempt()?.revision).toBe(1); expect(vm.code()).toBe('solution'); expect(vm.busy()).toBeFalse();
    vm.submit();
    const retry = http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit');
    expect(retry.request.body.revision).toBe(1); retry.flush({ ...attempt, code: 'solution', revision: 2, status: 'completed' });
  });
  it('retains unsaved code across browser query navigation', () => {
    vm.edit('draft kept locally');
    route.next(convertToParamMap({ view: 'history' }));
    route.next(convertToParamMap({ attempt: attempt._id }));
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush(attempt);
    http.expectOne('/api/coding-labs/published-labs/abc?versionId=version').flush(content);
    expect(vm.code()).toBe('draft kept locally'); expect(vm.dirty()).toBeTrue();
  });
  it('does not mark an empty catalog view as unsaved', () => {
    route.next(convertToParamMap({})); expect(vm.dirty()).toBeFalse();
  });
  it('focuses a referenced lab and preserves return context across attempt navigation', () => {
    route.next(convertToParamMap({ lab: 'abc', returnTo: '/workshops/overview?workshop=w1&page=p1', workshopName: 'Components' }));
    expect(vm.filtered().length).toBe(1); expect(vm.workshopName()).toBe('Components');
    vm.open(attempt);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['attempts', attempt._id], jasmine.objectContaining({ queryParamsHandling: 'merge' }));
    route.next(convertToParamMap({ lab: 'missing' }));
    expect(vm.filtered().length).toBe(0); expect(vm.missingLab()).toBeTrue();
    http.expectNone('/api/user-metadata/coding-lab-attempts');
  });

  it('protects unsaved code on return and confirms only once when the exit guard runs', async () => {
    route.next(convertToParamMap({ returnTo: '/workshops/overview?workshop=w1&page=p1' }));
    // Return to an owned attempt and edit its code.
    route.next(convertToParamMap({ attempt: attempt._id, returnTo: '/workshops/overview?workshop=w1&page=p1' }));
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush(attempt);
    http.expectOne('/api/coding-labs/published-labs/abc?versionId=version').flush(content);
    vm.edit('unsaved');
    const confirmation = spyOn(window, 'confirm').and.returnValue(false);
    vm.returnToWorkshop(); expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    confirmation.and.returnValue(true); vm.returnToWorkshop();
    expect(vm.canLeave()).toBeTrue(); expect(confirmation).toHaveBeenCalledTimes(2);
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/workshops/overview?workshop=w1&page=p1');
    await Promise.resolve(); expect(vm.code()).toBe('unsaved');
  });

  function launchFromWorkshop(returnTo = '/workshops/overview?workshop=w1&page=p1') {
    route.next(convertToParamMap({ attempt: attempt._id, lab: attempt.labId, returnTo }));
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush(attempt);
    http.expectOne('/api/coding-labs/published-labs/abc?versionId=version').flush(content);
  }
  for (const passed of [true, false]) it(`returns to the workshop after a completed submission (passed=${passed})`, () => {
    launchFromWorkshop();
    const confirmLeave = spyOn(window, 'confirm');
    vm.edit('solution'); vm.submit();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({ ...attempt, code: 'solution', revision: 1 });
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit').flush({ ...attempt, code: 'solution', revision: 2, status: 'completed', result: { passed, passedTests: passed ? 2 : 0, totalTests: 2, durationMs: 10, results: [] } });
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledOnceWith('/workshops/overview?workshop=w1&page=p1', { replaceUrl: true });
    expect(vm.canLeave()).toBeTrue(); expect(confirmLeave).not.toHaveBeenCalled();
  });
  it('stays in the assignment on submit failure and returns only after a successful retry', () => {
    launchFromWorkshop(); vm.submit();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit').flush({}, { status: 503, statusText: 'Offline' });
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    vm.submit();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit').flush({ ...attempt, status: 'completed' });
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledTimes(1);
  });
  it('does not return after saving code or after a noncompleted submission response', () => {
    launchFromWorkshop(); vm.edit('solution'); vm.save();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({ ...attempt, code: 'solution', revision: 1 });
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
    vm.submit(); http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit').flush({ ...attempt, code: 'solution', revision: 1 });
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
  });
  it('rejects external completion destinations and leaves results in the lab journey', () => {
    launchFromWorkshop('https://example.com'); vm.submit();
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt/submit').flush({ ...attempt, status: 'completed' });
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
  });
  it('allows historical completed results to be read without redirecting', () => {
    route.next(convertToParamMap({ attempt: attempt._id, returnTo: '/workshops/overview?workshop=w1&page=p1' }));
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({ ...attempt, status: 'completed' });
    expect(vm.attempt()?.status).toBe('completed');
    expect(TestBed.inject(Router).navigateByUrl).not.toHaveBeenCalled();
  });

  it('directly resumes an active workshop lab without creating another attempt', () => {
    route.next(convertToParamMap({ lab: lab.labId, launch: 'direct', returnTo: '/workshops/overview?workshop=w1&page=p1' }));
    TestBed.tick();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['attempts', attempt._id], jasmine.objectContaining({ replaceUrl: true, queryParamsHandling: 'merge', queryParams: { view: null, attempt: null, launch: null } }));
    http.expectNone(request => request.method === 'POST');
  });
  it('directly starts an available workshop lab only once and retries failed launch on explicit refresh', () => {
    const otherLab = { ...lab, labId: 'new-lab' };
    route.next(convertToParamMap({ lab: otherLab.labId, launch: 'direct', returnTo: '/workshops/overview?workshop=w1&page=p1' }));
    vm.refresh();
    http.expectOne('/api/coding-labs/published-labs').flush([otherLab]);
    http.expectOne('/api/user-metadata/coding-lab-attempts').flush([]); TestBed.tick();
    const start = http.expectOne('/api/user-metadata/coding-lab-attempts');
    expect(start.request.body.labId).toBe(otherLab.labId);
    TestBed.tick(); http.expectNone('/api/user-metadata/coding-lab-attempts');
    start.flush({}, { status: 503, statusText: 'Offline' }); TestBed.tick();
    http.expectNone('/api/user-metadata/coding-lab-attempts');
    vm.refresh();
    http.expectOne('/api/coding-labs/published-labs').flush([otherLab]);
    http.expectOne('/api/user-metadata/coding-lab-attempts').flush([]); TestBed.tick();
    http.expectOne('/api/user-metadata/coding-lab-attempts').flush({ ...attempt, _id: 'new-attempt', labId: otherLab.labId });
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['attempts', 'new-attempt'], jasmine.objectContaining({ replaceUrl: true, queryParams: { view: null, attempt: null, launch: null } }));
  });
  it('does not start an unavailable direct lab and leaves regular discovery untouched', () => {
    route.next(convertToParamMap({ lab: 'missing', launch: 'direct' })); TestBed.tick();
    expect(vm.missingLab()).toBeTrue(); http.expectNone(request => request.method === 'POST');
    route.next(convertToParamMap({ lab: lab.labId })); TestBed.tick();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    http.expectNone(request => request.method === 'POST');
  });

});
