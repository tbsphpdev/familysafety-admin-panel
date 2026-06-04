import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { getSubscriptions, statusChange, deleteSubscription } from '../../../store/Subscription/subscription.actions';
import { selectAllSubscriptions, selectSubscriptionLoading } from '../../../store/Subscription/subscription.reducer';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
  selector: 'app-subscription-list',
  imports: [CommonModule, RouterLink, SharedModule],
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

  deleteSubscription(id: any): void {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(deleteSubscription({ id }));
      }
    });
  }
}
