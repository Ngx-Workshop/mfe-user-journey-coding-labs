import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { BehaviorSubject } from 'rxjs';
import { JourneyViewModel } from '../../../../../../src/app/features/coding-labs/pages/journey/journey.view-model';
import { attempt, content, lab } from '../../../../../fixtures/labs';
describe('Coding journey commands', () => {
  let http: HttpTestingController;
  let vm: JourneyViewModel;
  let route: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    route = new BehaviorSubject(convertToParamMap({ attempt: attempt._id }));
    TestBed.configureTestingModule({ providers: [JourneyViewModel, provideHttpClient(), provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { queryParamMap: route } },
      { provide: Router, useValue: { navigate: jasmine.createSpy('navigate').and.resolveTo(true) } }] });
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
});
