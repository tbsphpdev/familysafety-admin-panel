import { Component, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getSubscriptions, statusChange, deleteSubscription } from '../../../store/Subscription/subscription.actions';
import { selectAllSubscriptions, selectSubscriptionLoading } from '../../../store/Subscription/subscription.reducer';
import Swal from 'sweetalert2';
import { SharedModule } from 'src/app/shared/shared.module';
import { ListStateService } from 'src/app/core/services/list-state.service';

@Component({
  selector: 'app-subscription-list',
  imports: [CommonModule, RouterLink, SharedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './subscription-list.component.html',
  styleUrl: './subscription-list.component.scss',
})
export class SubscriptionListComponent implements OnInit, OnDestroy {
  breadCrumbItems!: Array<{ label: string; active?: boolean }>;

  subscriptions: any[] = [];
  loading: boolean = false;
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [10, 50, 100];
  searchTerm: string = '';
  private destroy$ = new Subject<void>();

  constructor(public store: Store, private listState: ListStateService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Subscription', active: true }
    ];

    const savedState = this.listState.getState('subscriptions');
    this.currentPage = savedState.page;
    this.pageSize = savedState.per_page;
    this.searchTerm = savedState.search || '';
    this.loadSubscriptions();

    this.store.select(selectSubscriptionLoading).pipe(takeUntil(this.destroy$)).subscribe((isLoading: boolean) => {
      this.loading = isLoading;
    });

    this.store.select(selectAllSubscriptions).pipe(takeUntil(this.destroy$)).subscribe((data: any[]) => {
      this.subscriptions = data;
    });
  }

  onPageSizeChange(size: string | number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.loadSubscriptions();
  }

  viewSubscriptionDetails(planId: any): void {
    console.log('Selected Plan ID:', planId);
  }

  private loadSubscriptions(): void {
    this.listState.setState('subscriptions', {
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.searchTerm || ''
    });
    this.store.dispatch(getSubscriptions({ page: this.currentPage, per_page: this.pageSize, search: this.searchTerm }));
  }

  statusChange(id: any, isActive: boolean): void {
    Swal.fire({
      title: isActive ? 'Deactivate Subscription' : 'Activate Subscription',
      text: isActive ? 'Are you sure you want to deactivate this subscription?' : 'Are you sure you want to activate this subscription?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: isActive ? 'Yes, deactivate' : 'Yes, activate',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(statusChange({
          id,
          page: this.currentPage,
          per_page: this.pageSize,
          search: this.searchTerm
        }));
      }
    });
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
        this.store.dispatch(deleteSubscription({
          id,
          page: this.currentPage,
          per_page: this.pageSize,
          search: this.searchTerm
        }));
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

