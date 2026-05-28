import { Component, ViewChild } from '@angular/core';

// Get Modal
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Observable } from 'rxjs';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Store } from '@ngrx/store';
import { loadUsers, userSuspend, userUnsuspend } from '../../../store/Users/user.actions';
import { selectAll as selectAllUsers, selectCurrentPage, selectTotalPages, selectTotalUsers } from '../../../store/Users/user.reducer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  standalone: false,
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  providers: [DecimalPipe, DatePipe],
})
export class UserListComponent {
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
  currentPage: number = 1;
  totalPages: number = 1;
  totalUsers: number = 0;
  itemsPerPage: number = 10;

  constructor(private formBuilder: UntypedFormBuilder, public store: Store, public datepipe: DatePipe, private router: Router) {
  }

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.breadCrumbItems = [
      { label: 'Dashboard' },
      { label: 'Users', active: true }
    ];

    /**
     * Form Validation
     */
    this.ListForm = this.formBuilder.group({
      id: [''],
      clientName: ['', [Validators.required]],
      ticketTitle: ['', [Validators.required]],
      createDate: ['', [Validators.required]],
      dueDate: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });
    this.store.dispatch(loadUsers({ page: 1 }));
    this.store.select(selectAllUsers).subscribe((users) => {
      this.users = users;
      this.allusers = users;
      console.log('Users from store:', users);
    });

    this.store.select(selectCurrentPage).subscribe((p: number) => {
      this.currentPage = p || 1;
    });

    this.store.select(selectTotalUsers).subscribe((t: number) => {
      this.totalUsers = t || 0;
      this.store.select(selectTotalPages).subscribe((tp: number) => {
        this.totalPages = tp || 1;
        const perPage = tp && tp > 0 ? Math.ceil((this.totalUsers || 0) / tp) : 10;
        this.itemsPerPage = perPage > 0 ? perPage : 10;
      });
    });

  }

  onSearch(value: string) {
    this.term = value;
    this.currentPage = 1;
    this.store.dispatch(loadUsers({ page: 1, search: this.term }));
  }

  onSearchClick() {
    this.currentPage = 1;
    this.store.dispatch(loadUsers({ page: 1, search: this.term }));
  }

  tablepageChanged(event: any) {
    const page = (event && event.page) ? event.page : (typeof event === 'number' ? event : 1);
    this.store.dispatch(loadUsers({ page, search: this.term }));
  }

  userSuspend(id: any) {
    this.store.dispatch(userSuspend({ id, page: this.currentPage, search: this.term }));
  }

  userUnsuspend(id: any) {
    this.store.dispatch(userUnsuspend({ id, page: this.currentPage, search: this.term }));
  }

  viewUserDetails(id: any) {
    this.router.navigate(['/users/details', id]);
  }

}
