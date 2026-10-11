import { bootstrapApplication } from '@angular/platform-browser';
import { JourneyRootComponent } from './app/features/coding-labs/pages/journey/journey-root.component';
import { appConfig } from './app/app.config';

bootstrapApplication(JourneyRootComponent, appConfig).catch((error) => {
  console.error(error);
});
