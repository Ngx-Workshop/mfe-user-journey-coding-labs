import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ExampleMongodbDocListComponent } from './features/example-documents/pages/catalog/example-mongodb-doc-list.component';

@Component({
  selector: 'mfe-user-journey-coding-labs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ExampleMongodbDocListComponent],
  template: `<ngx-example-mongodb-doc-list />`,
  styles: [':host { display: block; }'],
})
export class App {}
export default App;
