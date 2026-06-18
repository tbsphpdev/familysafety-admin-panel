import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { fetchGroups, getGroup, getGroupFailure } from '../../../store/Group/group.actions';
import {
  selectAll as selectAllGroups,
  selectGroupsCurrentPage,
  selectGroupsTotalPages,
  selectGroupsTotalGroups,
  selectGroupsPageSize,
  selectGroupsLoading,
  selectGroupsSelectedItem,
} from '../../../store/Group/group.reducer';
import { ListStateService } from 'src/app/core/services/list-state.service';

@Component({
  selector: 'app-group-list',
  standalone: false,
  templateUrl: './group-list.component.html',
  styleUrls: ['./group-list.component.scss'],
})
export class GroupListComponent implements OnInit, OnDestroy {
  breadCrumbItems: Array<{}> = [];
  title = 'Groups';

  groups: any[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  totalGroups = 0;
  pageSize = 10;
  pageSizeOptions = [10, 50, 100];
  searchTerm = '';
  selectedItem: any = null;

  private destroy$ = new Subject<void>();

  constructor(private store: Store, private listState: ListStateService) {}

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Groups', active: true },
    ];

    const saved = this.listState.getState('group');
    this.currentPage = saved.page;
    this.pageSize = saved.per_page;
    this.searchTerm = saved.search || '';

    this.store.select(selectAllGroups).pipe(takeUntil(this.destroy$)).subscribe((g: any[]) => (this.groups = g || []));
    this.store.select(selectGroupsLoading).pipe(takeUntil(this.destroy$)).subscribe((l: boolean) => (this.loading = !!l));
    this.store.select(selectGroupsCurrentPage).pipe(takeUntil(this.destroy$)).subscribe((p: number) => (this.currentPage = p || 1));
    this.store.select(selectGroupsTotalPages).pipe(takeUntil(this.destroy$)).subscribe((tp: number) => (this.totalPages = tp || 1));
    this.store.select(selectGroupsTotalGroups).pipe(takeUntil(this.destroy$)).subscribe((tg: number) => (this.totalGroups = tg || 0));
    this.store.select(selectGroupsPageSize).pipe(takeUntil(this.destroy$)).subscribe((ps: number) => (this.pageSize = ps || this.pageSize));
    this.store.select(selectGroupsSelectedItem).pipe(takeUntil(this.destroy$)).subscribe((it: any) => (this.selectedItem = it));

    this.loadGroups();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(value: string): void {
    this.searchTerm = value;
    if (value.length >= 3 || value.length === 0) {
      this.currentPage = 1;
      this.loadGroups();
    }
  }

  onPageSizeChange(size: string | number): void {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.loadGroups();
  }

  tablePageChanged(page: number | string): void {
    if (page === '...') return;
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.loadGroups();
  }

  viewGroup(id: any): void {
    if (!id) return;
    this.store.dispatch(getGroup({ id }));
  }

  closeDetail(): void {
    this.store.dispatch(getGroupFailure({ error: null }));
  }

  private loadGroups(): void {
    this.listState.setState('group', {
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.searchTerm || '',
    });
    this.store.dispatch(fetchGroups({ page: this.currentPage, per_page: this.pageSize, search: this.searchTerm }));
  }

  get paginationPages(): Array<number | string> {
    const pages: Array<number | string> = [];
    if (this.totalPages <= 7) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
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
    return (this.currentPage - 1) * this.pageSize + index + 1;
  }

  openUserInNewTab(id: any): void {
    if (id) window.open('/users/' + id, '_blank');
  }

  getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
