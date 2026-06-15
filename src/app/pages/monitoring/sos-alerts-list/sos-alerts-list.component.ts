import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MonitoringService } from '../monitoring.service';
import { ToastrService } from 'ngx-toastr';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';

@Component({
  standalone: true,
  selector: 'app-sos-alerts-list',
  templateUrl: './sos-alerts-list.component.html',
  styleUrls: ['./sos-alerts-list.component.scss'],
  imports: [CommonModule, FormsModule, SharedModule, BsDatepickerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SosAlertsListComponent implements OnInit {
  breadCrumbItems: Array<{}> = [];
  title = 'SOS Alerts';
  slug = 'sos_alerts';
  term = '';
  pageSize = 10;
  pageSizeOptions = [10, 50, 100];
  monitoringList: any[] = [];
  tableColumns: string[] = [];
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;
  isLoading = false;
  dateRange?: (Date | undefined)[];
  createdAfter: string | null = null;
  createdBefore: string | null = null;
  datePickerConfig = {
    containerClass: 'theme-blue',
    showWeekNumbers: false,
    dateInputFormat: 'DD-MM-YYYY'
  };

  constructor(private monitoringService: MonitoringService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'SOS Alerts', active: true }
    ];
    this.loadMonitoringPage(1);
  }

  loadMonitoringPage(page = 1): void {
    this.isLoading = true;
    this.monitoringService.getMonitoringList(this.slug, page, this.term, {
      per_page: String(this.pageSize),
      created_after: this.createdAfter ?? '',
      created_before: this.createdBefore ?? ''
    }).subscribe(
      (response) => {
        this.isLoading = false;
        this.currentPage = response.current_page;
        this.totalPages = response.total_pages;
        this.totalItems = response.total_items;
        this.monitoringList = response.items;
        this.itemsPerPage = this.pageSize;
        this.tableColumns = this.monitoringList.length ? Object.keys(this.monitoringList[0]) : [];
      },
      (error) => {
        this.isLoading = false;
        this.toastr.error(error || 'Failed to load monitoring data', 'Error');
      }
    );
  }

  onSearchClick(): void {
    this.loadMonitoringPage(1);
  }

  onDateRangeChange(value: (Date | undefined)[] | undefined): void {
    this.dateRange = value;
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      this.applyDateFilter();
    }
  }

  applyDateFilter(): void {
    if (this.dateRange && this.dateRange.length === 2 && this.dateRange[0] && this.dateRange[1]) {
      this.createdAfter = this.formatDateForApi(this.dateRange[0]);
      this.createdBefore = this.formatDateForApi(this.dateRange[1]);
    } else {
      this.createdAfter = null;
      this.createdBefore = null;
    }
    this.loadMonitoringPage(1);
  }

  clearDateFilter(): void {
    this.dateRange = undefined;
    this.createdAfter = null;
    this.createdBefore = null;
    this.loadMonitoringPage(1);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = Number(size);
    this.loadMonitoringPage(1);
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  tablePageChanged(page: number | string): void {
    if (page === '...') {
      return;
    }
    if (typeof page !== 'number' || page < 1 || page > this.totalPages) {
      return;
    }
    this.loadMonitoringPage(page);
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

  getRowNumber(index: number): number {
    return ((this.currentPage || 1) - 1) * (this.itemsPerPage || 10) + index + 1;
  }

  formatValue(value: any): string {
    if (value === null || value === undefined) {
      return '-';
    }
    if (Array.isArray(value)) {
      return value.map(v => this.formatValue(v)).join(', ');
    }
    if (typeof value === 'object') {
      return value.name ?? value.title ?? JSON.stringify(value);
    }
    return String(value);
  }
}
