import {
  EnvironmentInjector,
  createEnvironmentInjector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { LabWorkspaceViewModel } from '../../../../../../src/app/features/coding-labs/pages/journey/lab-workspace.view-model';
import { CodingLabsStore } from '../../../../../../src/app/features/coding-labs/state/coding-labs.store';
import { attempt, content } from '../../../../../fixtures/labs';

describe('Scoped lab workspace', () => {
  let http: HttpTestingController;
  let firstScope: EnvironmentInjector | null;
  let secondScope: EnvironmentInjector;
  let first: LabWorkspaceViewModel;
  let second: LabWorkspaceViewModel;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
    const parent = TestBed.inject(EnvironmentInjector);
    firstScope = createEnvironmentInjector(
      [LabWorkspaceViewModel],
      parent
    );
    secondScope = createEnvironmentInjector(
      [LabWorkspaceViewModel],
      parent
    );
    first = firstScope.get(LabWorkspaceViewModel);
    second = secondScope.get(LabWorkspaceViewModel);
  });
  afterEach(() => {
    firstScope?.destroy();
    secondScope.destroy();
    http.verify();
  });
  function load(vm: LabWorkspaceViewModel) {
    vm.load(attempt._id).subscribe();
    http
      .expectOne('/api/user-metadata/coding-lab-attempts/attempt')
      .flush(attempt);
    http
      .expectOne(
        '/api/coding-labs/published-labs/abc?versionId=version'
      )
      .flush(content);
  }
  it('keeps drafts isolated while both scopes share authoritative saved progress', () => {
    load(first);
    load(second);
    first.edit('first scope draft');
    expect(second.code()).toBe(attempt.code);
    expect(second.dirty()).toBeFalse();
    first.save();
    http
      .expectOne('/api/user-metadata/coding-lab-attempts/attempt')
      .flush({ ...attempt, code: 'first scope draft', revision: 1 });
    expect(
      TestBed.inject(CodingLabsStore).attempts()[0].revision
    ).toBe(1);
    expect(second.code()).toBe(attempt.code);
    expect(first.dirty()).toBeFalse();
  });
  it('blocks another scope during a transaction and cancels commands on scope destruction', () => {
    load(first);
    load(second);
    first.edit('solution');
    first.submit(null);
    const save = http.expectOne(
      '/api/user-metadata/coding-lab-attempts/attempt'
    );
    second.save();
    http.expectNone('/api/user-metadata/coding-lab-attempts/attempt');
    firstScope!.destroy();
    firstScope = null;
    expect(save.cancelled).toBeTrue();
    expect(TestBed.inject(CodingLabsStore).busy()).toBeFalse();
    first.submit(null);
    http.expectNone('/api/user-metadata/coding-lab-attempts/attempt');
    second.save();
    http
      .expectOne('/api/user-metadata/coding-lab-attempts/attempt')
      .flush(attempt);
  });
});
