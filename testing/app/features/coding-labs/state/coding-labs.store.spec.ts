import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CodingLabsStore } from '../../../../../src/app/features/coding-labs/state/coding-labs.store';
import { attempt, lab } from '../../../../fixtures/labs';
describe('Coding labs store', () => {
  let http: HttpTestingController;
  let store: CodingLabsStore;
  beforeEach(() => { TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] }); http = TestBed.inject(HttpTestingController); store = TestBed.inject(CodingLabsStore); });
  afterEach(() => http.verify());
  it('retains successful records on refresh failure', () => {
    store.refresh(); http.expectOne('/api/coding-labs/published-labs').flush([lab]); http.expectOne('/api/user-metadata/coding-lab-attempts').flush([attempt]);
    store.refresh(); http.expectOne('/api/user-metadata/coding-lab-attempts').flush([]); http.expectOne('/api/coding-labs/published-labs').flush({}, { status: 503, statusText: 'Offline' });
    expect(store.labs()).toEqual([lab]); expect(store.attempts()).toEqual([attempt]); expect(store.loading()).toBeFalse();
  });
  it('preserves earlier history when a new attempt starts', () => {
    store.refresh(); http.expectOne('/api/coding-labs/published-labs').flush([lab]); http.expectOne('/api/user-metadata/coding-lab-attempts').flush([{ ...attempt, status: 'completed' }]);
    store.start({ labId: lab.labId, requestId: 'request' }).subscribe();
    const request = http.expectOne('/api/user-metadata/coding-lab-attempts'); expect(request.request.withCredentials).toBeTrue(); request.flush({ ...attempt, _id: 'retry' });
    expect(store.attempts().map(a => a._id)).toEqual(['retry', 'attempt']);
  });
  it('keeps errors useful and releases busy after failed saves', () => {
    store.save(attempt._id, { code: 'edited', revision: 0 }).subscribe(); expect(store.busy()).toBeTrue();
    const request = http.expectOne('/api/user-metadata/coding-lab-attempts/attempt'); expect(request.request.body).toEqual({ code: 'edited', revision: 0 });
    request.flush({}, { status: 409, statusText: 'Conflict' }); expect(store.error()).toContain('Copy your code'); expect(store.busy()).toBeFalse();
  });
  it('opens completed results without requesting unavailable archived content', () => {
    let title = ''; store.loadAttempt('attempt').subscribe(data => title = data.attempt.title);
    http.expectOne('/api/user-metadata/coding-lab-attempts/attempt').flush({ ...attempt, status: 'completed' });
    expect(title).toBe(attempt.title); http.expectNone('/api/coding-labs/published-labs/abc');
  });
});
