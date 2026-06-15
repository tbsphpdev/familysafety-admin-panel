import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { Summary } from 'src/app/store/Dashboard/dashboard.model';

@Component({
  selector: 'app-subscription-summary',
  standalone: true,
  imports: [CommonModule, ProgressbarModule],
  templateUrl: './subscription-summary.component.html',
})
export class SubscriptionSummaryComponent {
  @Input() summary?: Summary;
}
