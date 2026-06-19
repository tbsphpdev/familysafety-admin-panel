import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MonitoringActions } from 'src/app/store/Monitoring/monitoring.actions';
import {
  selectPaymentHistory,
  selectPaymentHistoryCurrentPage,
  selectPaymentHistoryTotalPages,
  selectPaymentHistoryTotalItems,
  selectPaymentHistoryPageSize,
  selectPaymentHistoryLoading,
  selectPaymentHistoryError
} from 'src/app/store/Monitoring/monitoring.reducer';

@Component({
  standalone: true,
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss'],
  imports: [CommonModule, RouterModule, FormsModule, SharedModule, BsDatepickerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PaymentHistoryComponent implements OnInit, OnDestroy {
  breadCrumbItems: Array<{}> = [];
  title = 'Payment History';
  term = '';
  pageSize = 10;
  pageSizeOptions = [10, 50, 100];
  paymentHistory: any[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  isLoading = false;

  // Date range filter properties
  dateRange?: (Date | undefined)[];
  dateFrom: string | null = null;
  dateTo: string | null = null;
  datePickerConfig = {
    containerClass: 'theme-blue',
    showWeekNumbers: false,
    dateInputFormat: 'DD-MM-YYYY'
  };

  // Sorting properties
  ordering = '';
  sortField: 'full_name' | 'email' | 'event_type' | 'payment_source' | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  private destroy$ = new Subject<void>();
  private searchTimeout: any;

  constructor(private toastr: ToastrService, private store: Store) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Payment History', active: true }
    ];

    // Subscribe to store selectors
    this.store.select(selectPaymentHistory).pipe(
      takeUntil(this.destroy$)
    ).subscribe((items) => {
      this.paymentHistory = items || [];
    });

    this.store.select(selectPaymentHistoryCurrentPage).pipe(
      takeUntil(this.destroy$)
    ).subscribe((page) => {
      this.currentPage = page || 1;
    });

    this.store.select(selectPaymentHistoryTotalPages).pipe(
      takeUntil(this.destroy$)
    ).subscribe((totalPages) => {
      this.totalPages = totalPages || 1;
    });

    this.store.select(selectPaymentHistoryTotalItems).pipe(
      takeUntil(this.destroy$)
    ).subscribe((totalItems) => {
      this.totalItems = totalItems || 0;
    });

    this.store.select(selectPaymentHistoryPageSize).pipe(
      takeUntil(this.destroy$)
    ).subscribe((pageSize) => {
      this.itemsPerPage = pageSize || 10;
    });

    this.store.select(selectPaymentHistoryLoading).pipe(
      takeUntil(this.destroy$)
    ).subscribe((loading) => {
      this.isLoading = loading;
    });

    this.store.select(selectPaymentHistoryError).pipe(
      takeUntil(this.destroy$)
    ).subscribe((error) => {
      if (error) {
        this.toastr.error(error || 'Failed to load payment history', 'Error');
      }
    });

    this.loadPaymentHistory(1);
  }

  loadPaymentHistory(page = 1): void {
    this.store.dispatch(MonitoringActions.loadPaymentHistory({
      page,
      search: this.term,
      perPage: this.pageSize,
      dateFrom: this.dateFrom,
      dateTo: this.dateTo,
      ordering: this.ordering || undefined
    }));
  }

  onSearchClick(): void {
    this.loadPaymentHistory(1);
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    if (this.term.length === 0) {
      this.loadPaymentHistory(1);
      return;
    }
    if (this.term.length >= 3) {
      this.searchTimeout = setTimeout(() => this.loadPaymentHistory(1), 400);
    }
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.loadPaymentHistory(1);
  }

  onDateRangeChange(value: (Date | undefined)[] | undefined): void {
    this.dateRange = value;
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      this.applyDateFilter();
    }
  }

  applyDateFilter(): void {
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      this.dateFrom = this.formatDateForApi(this.dateRange[0]);
      this.dateTo = this.formatDateForApi(this.dateRange[1]);
    } else {
      this.dateFrom = null;
      this.dateTo = null;
    }
    this.loadPaymentHistory(1);
  }

  clearDateFilter(): void {
    this.dateRange = undefined;
    this.dateFrom = null;
    this.dateTo = null;
    this.loadPaymentHistory(1);
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSort(field: 'full_name' | 'email' | 'event_type' | 'payment_source'): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.ordering = this.sortDirection === 'asc' ? field : `-${field}`;
    this.loadPaymentHistory(1);
  }

  getSortIcon(field: 'full_name' | 'email' | 'event_type' | 'payment_source'): string {
    if (this.sortField !== field) {
      return 'ri-arrow-up-down-line';
    }
    return this.sortDirection === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
  }

  openUserInNewTab(id: any): void {
    if (id) { window.open('/users/' + id, '_blank'); }
  }

  getRowNumber(index: number): number {
    return ((this.currentPage || 1) - 1) * (this.itemsPerPage || 10) + index + 1;
  }

  tablePageChanged(page: number | string): void {
    if (page === '...') {
      return;
    }
    if (typeof page !== 'number' || page < 1 || page > this.totalPages) {
      return;
    }
    this.loadPaymentHistory(page);
  }

  get paginationPages(): Array<number | string> {
    const pages: Array<number | string> = [];

    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (this.currentPage <= 4) {
      pages.push(2, 3, 4, 5, '...', this.totalPages);
    } else if (this.currentPage >= this.totalPages - 3) {
      pages.push('...', this.totalPages - 4, this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages);
    } else {
      pages.push('...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages);
    }

    return pages;
  }

  formatAmount(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return `$${Number(value).toFixed(2)}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
