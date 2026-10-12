import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { JourneyViewModel } from './journey.view-model';
import { LabCatalogComponent } from '../../components/catalog/lab-catalog.component';
import { LabHistoryComponent } from '../../components/history/lab-history.component';
import { LabRunnerComponent } from '../../components/runner/lab-runner.component';
import { LabResultComponent } from '../../components/result/lab-result.component';

@Component({
  selector: 'ngx-lab-journey-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    LabCatalogComponent,
    LabHistoryComponent,
    LabRunnerComponent,
    LabResultComponent,
  ],
  template: `
    @if (vm.view() === 'attempt' || vm.view() === 'result') {
      @if (vm.attempt(); as attempt) {
        @if (attempt.status === 'completed') {
          <ngx-lab-result
            [attempt]="attempt"
            [busy]="vm.busy()"
            (retry)="vm.start($event)"
            (back)="vm.navigate('history')"
          />
        } @else if (vm.content(); as content) {
          @for (item of [attempt]; track item._id) {
            <ngx-lab-runner
              [attempt]="item"
              [content]="content"
              [code]="vm.code()"
              [busy]="vm.busy()"
              [dirty]="vm.dirty()"
              [saved]="vm.saved()"
              (edit)="vm.edit($event)"
              (save)="vm.save()"
              (submit)="vm.submit()"
              (back)="vm.navigate('explore')"
            />
          }
        }
      }
    } @else if (!vm.loading() && !vm.openingAssignment()) {
      @if (vm.view() === 'history') {
        <ngx-lab-history
          [attempts]="vm.attempts()"
          [busy]="vm.busy()"
          (open)="vm.open($event)"
          (retry)="vm.start($event)"
        />
      } @else if (vm.missingLab()) {
        <div class="lab-journey__missing" role="status">
          <h2>Workshop lab unavailable</h2>
          <p>
            This coding lab is no longer published. You can continue
            your workshop or explore other labs.
          </p>
          <button mat-button (click)="vm.showAllLabs()">
            Explore all labs
          </button>
        </div>
      } @else {
        @if (vm.labId()) {
          <button mat-button (click)="vm.showAllLabs()">
            Explore all labs
          </button>
        }
        <ngx-lab-catalog
          [labs]="vm.filtered()"
          [attempts]="vm.attempts()"
          [busy]="vm.busy()"
          [search]="vm.search()"
          (searchChange)="vm.setSearch($event)"
          (start)="vm.start($event)"
        />
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .lab-journey__missing {
        padding: 40px 0;
      }
    `,
  ],
})
export class JourneyContentComponent {
  readonly vm = inject(JourneyViewModel);
}
