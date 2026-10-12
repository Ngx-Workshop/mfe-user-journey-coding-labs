import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, InjectionToken, inject } from '@angular/core';
import {
  LabAttempt,
  LabSummary,
  PublishedLab,
  SaveAttempt,
  StartAttempt,
} from '../models/coding-labs.models';
export const LABS_API = new InjectionToken<string>('LABS_API', {
  providedIn: 'root',
  factory: () => '/api/coding-labs',
});
export const ATTEMPTS_API = new InjectionToken<string>(
  'ATTEMPTS_API',
  {
    providedIn: 'root',
    factory: () => '/api/user-metadata/coding-lab-attempts',
  }
);
@Injectable({ providedIn: 'root' })
export class CodingLabsApi {
  private readonly http = inject(HttpClient);
  private readonly labs = inject(LABS_API).replace(/\/$/, '');
  private readonly attempts = inject(ATTEMPTS_API).replace(/\/$/, '');
  private readonly options = { withCredentials: true };
  catalog() {
    return this.http.get<LabSummary[]>(
      `${this.labs}/published-labs`,
      this.options
    );
  }
  content(id: string, versionId: string) {
    return this.http.get<PublishedLab>(
      `${this.labs}/published-labs/${encodeURIComponent(id)}`,
      {
        ...this.options,
        params: new HttpParams().set('versionId', versionId),
      }
    );
  }
  history() {
    return this.http.get<LabAttempt[]>(this.attempts, this.options);
  }
  attempt(id: string) {
    return this.http.get<LabAttempt>(
      `${this.attempts}/${encodeURIComponent(id)}`,
      this.options
    );
  }
  start(body: StartAttempt) {
    return this.http.post<LabAttempt>(
      this.attempts,
      body,
      this.options
    );
  }
  save(id: string, body: SaveAttempt) {
    return this.http.patch<LabAttempt>(
      `${this.attempts}/${encodeURIComponent(id)}`,
      body,
      this.options
    );
  }
  submit(id: string, body: SaveAttempt) {
    return this.http.post<LabAttempt>(
      `${this.attempts}/${encodeURIComponent(id)}/submit`,
      body,
      this.options
    );
  }
}
