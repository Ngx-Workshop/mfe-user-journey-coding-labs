import type { components as Labs } from './coding-labs.contract';
import type { components as Metadata } from './user-metadata.contract';
export type LabSummary = Labs['schemas']['LabSummaryDto'];
export type PublishedLab = Labs['schemas']['PublishedLabDto'];
export type LabAttempt = Metadata['schemas']['LabAttemptDto'];
export type SaveAttempt = Metadata['schemas']['SaveLabAttemptDto'];
export type StartAttempt = Metadata['schemas']['StartLabAttemptDto'];
export type LabView = 'explore' | 'history' | 'attempt';
