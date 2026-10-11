import { HttpErrorResponse } from '@angular/common/http';
export function labError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) return 'Sign in to save your progress and view your lab history.';
    if (error.status === 409) return 'This attempt changed or is being graded. Copy your code, then reload the attempt before trying again.';
    if (error.status === 404) return 'This lab or attempt is no longer available.';
    if (error.status === 429) return 'The runner is busy. Please try again shortly.';
    if (error.status === 503) return 'The lab service is unavailable. Your code is still here; please retry.';
  }
  return 'We couldn’t complete that request. Please try again.';
}
