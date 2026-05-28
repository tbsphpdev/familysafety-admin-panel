import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getSubscriptions, statusChange } from '../../../store/Subscription/subscription.actions';
import { selectAllSubscriptions, selectSubscriptionLoading } from '../../../store/Subscription/subscription.reducer';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-subscription-list',
  imports: [CommonModule, RouterLink],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './subscription-list.component.html',
  styleUrl: './subscription-list.component.scss',
})
export class SubscriptionListComponent implements OnInit {
  breadCrumbItems!: Array<{ label: string; active?: boolean }>;

  subscriptions: any[] = [];
  loading: boolean = false;

  constructor(public store: Store) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Subscription', active: true }
    ];

    this.store.dispatch(getSubscriptions());

    this.store.select(selectSubscriptionLoading).subscribe((isLoading: boolean) => {
      this.loading = isLoading;
    });

    this.store.select(selectAllSubscriptions).subscribe((data: any[]) => {
      this.subscriptions = data;
    });
  }

  viewSubscriptionDetails(planId: any): void {
    console.log('Selected Plan ID:', planId);
  }

  statusChange(id: any): void {
    this.store.dispatch(statusChange({ id }));
  }
}
