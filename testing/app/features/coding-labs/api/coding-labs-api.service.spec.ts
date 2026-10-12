import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import {
  ATTEMPTS_API,
  CodingLabsApi,
  LABS_API,
} from '../../../../../src/app/features/coding-labs/api/coding-labs-api.service';
import { attempt, content, lab } from '../../../../fixtures/labs';

describe('Coding labs HTTP boundary', () => {
  let api: CodingLabsApi;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: LABS_API, useValue: '/labs/' },
        { provide: ATTEMPTS_API, useValue: '/attempts/' },
      ],
    });
    api = TestBed.inject(CodingLabsApi);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses configured credentialed catalog and history endpoints without retaining responses', () => {
    api.catalog().subscribe();
    api.history().subscribe();
    const catalog = http.expectOne('/labs/published-labs');
    const history = http.expectOne('/attempts');
    expect(catalog.request.withCredentials).toBeTrue();
    expect(history.request.withCredentials).toBeTrue();
    catalog.flush([lab]);
    history.flush([attempt]);
    api.catalog().subscribe();
    http.expectOne('/labs/published-labs').flush([]);
  });
  it('encodes resource IDs and pins published content to its requested version', () => {
    api.content('lab/id', 'version & 2').subscribe();
    const request = http.expectOne(
      (r) => r.url === '/labs/published-labs/lab%2Fid'
    );
    expect(request.request.params.get('versionId')).toBe(
      'version & 2'
    );
    expect(request.request.withCredentials).toBeTrue();
    request.flush(content);
    api.attempt('attempt/id').subscribe();
    const detail = http.expectOne('/attempts/attempt%2Fid');
    expect(detail.request.withCredentials).toBeTrue();
    detail.flush(attempt);
  });
  it('sends start, save and submit payloads without changing revision or request identity', () => {
    const startBody = { labId: 'abc', requestId: 'request' };
    api.start(startBody).subscribe();
    const start = http.expectOne('/attempts');
    expect(start.request.method).toBe('POST');
    expect(start.request.body).toEqual(startBody);
    expect(start.request.withCredentials).toBeTrue();
    start.flush(attempt);
    const body = { code: 'solution', revision: 7 };
    api.save('attempt/id', body).subscribe();
    const save = http.expectOne('/attempts/attempt%2Fid');
    expect(save.request.method).toBe('PATCH');
    expect(save.request.body).toEqual(body);
    expect(save.request.withCredentials).toBeTrue();
    save.flush(attempt);
    api.submit('attempt/id', body).subscribe();
    const submit = http.expectOne('/attempts/attempt%2Fid/submit');
    expect(submit.request.method).toBe('POST');
    expect(submit.request.body).toEqual(body);
    expect(submit.request.withCredentials).toBeTrue();
    submit.flush(attempt);
  });
});
