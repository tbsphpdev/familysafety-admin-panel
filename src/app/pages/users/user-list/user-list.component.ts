import { Component, ViewChild, OnDestroy } from '@angular/core';

// Get Modal
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { loadUsers, userSuspend, userUnsuspend, deleteUser } from '../../../store/Users/user.actions';
import { selectAll as selectAllUsers, selectCurrentPage, selectTotalPages, selectTotalUsers, selectUsersLoading } from '../../../store/Users/user.reducer';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ListStateService } from 'src/app/core/services/list-state.service';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [DecimalPipe, DatePipe],
})
export class UserListComponent implements OnDestroy {
  // bread crumb items
  breadCrumbItems!: Array<{}>;
  deleteID: any;
  endItem: any
  ListForm!: UntypedFormGroup;
  submitted = false;
  masterSelected!: boolean;
  userList: any;
  users: any;
  // assigndata: any
  assignList: any;
  term: any
  @ViewChild('addUsers', { static: false }) addUsers?: ModalDirective;
  @ViewChild('deleteRecordModal', { static: false }) deleteRecordModal?: ModalDirective;
  assignto: any = [];
  editData: any;
  allusers: any;
  loading = false;
  currentPage: number = 1;
  totalPages: number = 1;
  totalUsers: number = 0;
  pageSize: number = 10;
  pageSizeOptions = [10, 50, 100];
  itemsPerPage: number = 10;
  ordering: string = '';
  sortField: 'full_name' | 'email' | 'last_active' | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  isMinor: string = '';
  statusFilter: string = '';
  private destroy$ = new Subject<void>();
  private searchTimeout: any;

  constructor(private formBuilder: UntypedFormBuilder, public store: Store, public datepipe: DatePipe, private router: Router, private listState: ListStateService) {
  }

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Users', active: true }
    ];

    this.ListForm = this.formBuilder.group({
      id: [''],
      clientName: ['', [Validators.required]],
      ticketTitle: ['', [Validators.required]],
      createDate: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });

    const prevUrl = this.router.lastSuccessfulNavigation()?.previousNavigation?.finalUrl?.toString() ?? '';
    if (prevUrl && !prevUrl.startsWith('/users')) {
      this.listState.resetState('users');
    }

    const savedState = this.listState.getState('users');
    this.currentPage = savedState.page;
    this.pageSize = savedState.per_page;
    this.term = savedState.search || '';
    this.setOrderingState(savedState.ordering || '');
    this.loadUsers();
    console.log("User Current Page:- ", this.currentPage, "Page Size:- ", this.pageSize, "Search Term:- ", this.term, "Ordering:- ", this.ordering);

    this.store.select(selectUsersLoading).pipe(
      takeUntil(this.destroy$)
    ).subscribe((l) => { this.loading = l; });

    this.store.select(selectAllUsers).pipe(
      takeUntil(this.destroy$)
    ).subscribe((users) => {
      this.users = users;
      this.allusers = users;
      this.itemsPerPage = Math.max(this.itemsPerPage, users?.length || 0);
      console.log('Users from store:', users);
    });

    this.store.select(selectCurrentPage).pipe(
      takeUntil(this.destroy$)
    ).subscribe((p: number) => {
      this.currentPage = p || 1;
    });

    this.store.select(selectTotalUsers).pipe(
      takeUntil(this.destroy$)
    ).subscribe((t: number) => {
      this.totalUsers = t || 0;
    });

    this.store.select(selectTotalPages).pipe(
      takeUntil(this.destroy$)
    ).subscribe((tp: number) => {
      this.totalPages = tp || 1;
      const perPage = tp && tp > 0 ? Math.ceil((this.totalUsers || 0) / tp) : 10;
      this.itemsPerPage = Math.max(this.itemsPerPage, perPage > 0 ? perPage : 10);
    });
  }

  getRowNumber(index: number): number {
    return ((this.currentPage || 1) - 1) * (this.itemsPerPage || 10) + index + 1;
  }

  getInitials(name?: string): string {
    if (!name) {
      return '';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  onSearch(value: string) {
    this.term = value;
    this.currentPage = 1;
    this.loadUsers();
  }

  onSearchClick() {
    this.currentPage = 1;
    this.loadUsers();
  }

  onSearchInput(): void {
    clearTimeout(this.searchTimeout);
    if (this.term.length === 0) {
      this.currentPage = 1;
      this.loadUsers();
      return;
    }
    if (this.term.length >= 3) {
      this.searchTimeout = setTimeout(() => {
        this.currentPage = 1;
        this.loadUsers();
      }, 400);
    }
  }

  onPageSizeChange(size: string | number) {
    this.pageSize = Number(size);
    this.currentPage = 1;
    this.loadUsers();
  }

  tablepageChanged(event: any) {
    const page = (event && event.page) ? event.page : (typeof event === 'number' ? event : 1);
    this.currentPage = page;
    this.loadUsers();
  }

  onSort(field: 'full_name' | 'email' | 'last_active') {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.ordering = this.sortDirection === 'asc' ? field : `-${field}`;
    this.currentPage = 1;
    this.loadUsers();
  }

  getSortIcon(field: 'full_name' | 'email' | 'last_active'): string {
    if (this.sortField !== field) {
      return 'ri-arrow-up-down-line';
    }
    return this.sortDirection === 'asc' ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  private setOrderingState(ordering: string) {
    this.ordering = ordering;
    const field = ordering.replace('-', '');
    if (field === 'full_name' || field === 'email' || field === 'last_active') {
      this.sortField = field as 'full_name' | 'email' | 'last_active';
      this.sortDirection = ordering.startsWith('-') ? 'desc' : 'asc';
    } else {
      this.sortField = '';
      this.sortDirection = 'asc';
    }
  }

  private loadUsers() {
    this.listState.setState('users', {
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.term || '',
      ordering: this.ordering || ''
    });
    this.store.dispatch(loadUsers({
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.term,
      ordering: this.ordering || undefined,
      is_minor: this.isMinor || undefined,
      status: this.statusFilter || undefined
    }));
  }

  userSuspend(id: any) {
    Swal.fire({
      title: 'Suspend User',
      text: 'Are you sure you want to suspend this user?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, suspend',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(userSuspend({ id, page: this.currentPage, per_page: this.pageSize, search: this.term, ordering: this.ordering || undefined, is_minor: this.isMinor || undefined, status: this.statusFilter || undefined }));
      }
    });
  }

  userUnsuspend(id: any) {
    Swal.fire({
      title: 'Unsuspend User',
      text: 'Are you sure you want to unsuspend this user?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, unsuspend',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.store.dispatch(userUnsuspend({ id, page: this.currentPage, per_page: this.pageSize, search: this.term, ordering: this.ordering || undefined, is_minor: this.isMinor || undefined, status: this.statusFilter || undefined }));
      }
    });
  }

  onDeleteUser(id: any): void {
    Swal.fire({
      title: 'Delete User',
      text: 'Are you sure you want to delete this user? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const is_suspended = this.statusFilter === 'suspended' ? 'true' : this.statusFilter === 'active' ? 'false' : undefined;
        this.store.dispatch(deleteUser({ id, page: this.currentPage, per_page: this.pageSize, search: this.term, ordering: this.ordering || undefined, is_minor: this.isMinor || undefined, status: this.statusFilter || undefined }));
      }
    });
  }

  viewUserDetails(id: any) {
    this.router.navigate(['/users', id]);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
