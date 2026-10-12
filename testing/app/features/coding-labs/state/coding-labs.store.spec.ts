import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { CodingLabsStore } from '../../../../../src/app/features/coding-labs/state/coding-labs.store';
import { attempt, lab } from '../../../../fixtures/labs';
describe('Coding labs store', () => {
  let http: HttpTestingController;
  let store: CodingLabsStore;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    store = TestBed.inject(CodingLabsStore);
  });
  afterEach(() => http.verify());
  it('retains successful records on refresh failure', () => {
    store.refresh();
    http.expectOne('/api/coding-labs/published-labs').flush([lab]);
    http
      .expectOne('/api/user-metadata/coding-lab-attempts')
      .flush([attempt]);
    store.refresh();
    http
      .expectOne('/api/user-metadata/coding-lab-attempts')
      .flush([]);
    http
      .expectOne('/api/coding-labs/published-labs')
      .flush({}, { status: 503, statusText: 'Offline' });
    expect(store.labs()).toEqual([lab]);
    expect(store.attempts()).toEqual([attempt]);
    expect(store.loading()).toBeFalse();
  });
  it('preserves earlier history when a new attempt starts', () => {
    store.refresh();
    http.expectOne('/api/coding-labs/published-labs').flush([lab]);
    http
      .expectOne('/api/user-metadata/coding-lab-attempts')
      .flush([{ ...attempt, status: 'completed' }]);
    store
      .start({ labId: lab.labId, requestId: 'request' })
      .subscribe();
    const request = http.expectOne(
      '/api/user-metadata/coding-lab-attempts'
    );
    expect(request.request.withCredentials).toBeTrue();
    request.flush({ ...attempt, _id: 'retry' });
    expect(store.attempts().map((a) => a._id)).toEqual([
      'retry',
      'attempt',
    ]);
  });
  it('keeps errors useful and releases busy after failed saves', () => {
    store
      .save(attempt._id, { code: 'edited', revision: 0 })
      .subscribe();
    expect(store.busy()).toBeTrue();
    const request = http.expectOne(
      '/api/user-metadata/coding-lab-attempts/attempt'
    );
    expect(request.request.body).toEqual({
      code: 'edited',
      revision: 0,
    });
    request.flush({}, { status: 409, statusText: 'Conflict' });
    expect(store.error()).toContain('Copy your code');
    expect(store.busy()).toBeFalse();
  });
  it('opens completed results without requesting unavailable archived content', () => {
    let title = '';
    store
      .loadAttempt('attempt')
      .subscribe((data) => (title = data.attempt.title));
    http
      .expectOne('/api/user-metadata/coding-lab-attempts/attempt')
      .flush({ ...attempt, status: 'completed' });
    expect(title).toBe(attempt.title);
    http.expectNone('/api/coding-labs/published-labs/abc');
  });
  it('keeps one busy transaction across save and grade, publishing the saved revision first', () => {
    const emissions: Array<{
      revision: number | null;
      busy: boolean;
    }> = [];
    store.saveAndSubmit(attempt, 'solution').subscribe((progress) => {
      emissions.push({
        revision: progress?.revision ?? null,
        busy: store.busy(),
      });
    });
    const save = http.expectOne(
      '/api/user-metadata/coding-lab-attempts/attempt'
    );
    expect(save.request.method).toBe('PATCH');
    save.flush({ ...attempt, code: 'solution', revision: 1 });
    expect(emissions).toEqual([{ revision: 1, busy: true }]);
    expect(store.attempts()[0].revision).toBe(1);
    const grade = http.expectOne(
      '/api/user-metadata/coding-lab-attempts/attempt/submit'
    );
    expect(grade.request.body).toEqual({
      code: 'solution',
      revision: 1,
    });
    grade.flush({
      ...attempt,
      code: 'solution',
      revision: 2,
      status: 'completed',
    });
    expect(emissions).toEqual([
      { revision: 1, busy: true },
      { revision: 2, busy: true },
    ]);
    expect(store.busy()).toBeFalse();
  });
  it('retains the saved server revision when grading fails', () => {
    store.saveAndSubmit(attempt, 'solution').subscribe();
    http
      .expectOne('/api/user-metadata/coding-lab-attempts/attempt')
      .flush({ ...attempt, code: 'solution', revision: 1 });
    http
      .expectOne(
        '/api/user-metadata/coding-lab-attempts/attempt/submit'
      )
      .flush({}, { status: 503, statusText: 'Offline' });
    expect(store.attempts()[0].revision).toBe(1);
    expect(store.attempts()[0].code).toBe('solution');
    expect(store.error()).toBeTruthy();
    expect(store.busy()).toBeFalse();
  });
  it('cancels an obsolete refresh and keeps loading true for its replacement', () => {
    store.refresh();
    const oldCatalog = http.expectOne(
      '/api/coding-labs/published-labs'
    );
    const oldHistory = http.expectOne(
      '/api/user-metadata/coding-lab-attempts'
    );
    store.refresh();
    expect(oldCatalog.cancelled).toBeTrue();
    expect(oldHistory.cancelled).toBeTrue();
    expect(store.loading()).toBeTrue();
    http.expectOne('/api/coding-labs/published-labs').flush([lab]);
    http
      .expectOne('/api/user-metadata/coding-lab-attempts')
      .flush([]);
    expect(store.loading()).toBeFalse();
    expect(store.labs()).toEqual([lab]);
  });
  it('releases transaction busy state when its scoped subscriber is destroyed', () => {
    const subscription = store
      .saveAndSubmit(attempt, 'solution')
      .subscribe();
    const request = http.expectOne(
      '/api/user-metadata/coding-lab-attempts/attempt'
    );
    subscription.unsubscribe();
    expect(request.cancelled).toBeTrue();
    expect(store.busy()).toBeFalse();
    http.expectNone(
      '/api/user-metadata/coding-lab-attempts/attempt/submit'
    );
  });
});
