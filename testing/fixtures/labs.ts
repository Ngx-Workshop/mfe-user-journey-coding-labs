import {
  LabAttempt,
  LabSummary,
  PublishedLab,
} from '../../src/app/features/coding-labs/models/coding-labs.models';
export const lab: LabSummary = {
  labId: 'abc',
  title: 'Sum an array',
  summary: 'Add numbers in an array.',
  slug: 'sum-array',
  tags: ['JavaScript'],
  workshopId: 'workshop',
  difficulty: 'intro',
  estimatedMinutes: 10,
};
export const attempt: LabAttempt = {
  _id: 'attempt',
  labId: 'abc',
  versionId: 'version',
  versionNumber: 1,
  title: 'Sum an array',
  code: 'function solve(input) { return 0; }',
  revision: 0,
  status: 'in-progress',
  startedAt: '2026-10-11T12:00:00Z',
  updatedAt: '2026-10-11T12:00:00Z',
};
export const content: PublishedLab = {
  labId: 'abc',
  versionId: 'version',
  versionNumber: 1,
  title: 'Sum an array',
  language: 'javascript',
  promptMarkdown: 'Add the numbers.',
  hints: [],
  starterCode: attempt.code,
  sampleTests: [],
  entryFnName: 'solve',
};
