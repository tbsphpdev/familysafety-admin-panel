import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, ParamMap, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadUser, updateUser, updateUserSuccess, updateUserFailure } from '../../../store/Users/user.actions';
import { selectEntities } from '../../../store/Users/user.reducer';
import { UserService } from '../user.service';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnInit, OnDestroy {
  userdetails: any = null;
  subscriptionDetails: any = null;
  referralDetails: any = null;
  familyOwner: any = null;
  familyMembers: any = null;
  paymentHistory: any[] = [];
  paymentHistoryTotal: number = 0;
  paymentHistoryTotalPages: number = 0;
  paymentHistoryCurrentPage: number = 1;
  paymentHistoryLoading: boolean = false;
  userId!: number;
  loading = false;
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      date_of_birth: [''],
      is_minor: [false]
    });

    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe((params: ParamMap) => {
      const id = params.get('id');
      if (id) {
        this.userId = Number(id);
        this.store.dispatch(loadUser({ id: this.userId }));
      }
    });

    this.store.select(selectEntities).pipe(
      takeUntil(this.destroy$)
    ).subscribe((entities: any) => {
      if (entities && this.userId) {
        const user = entities[this.userId];
        if (user) {
          this.userdetails = user;
          this.subscriptionDetails = user.user_subs ?? null;
          this.referralDetails = user.referrals?.list ?? null;
          this.familyOwner = user.user_subs?.family_owner ?? null;
          this.familyMembers = user.user_subs?.family_members ?? null;
          this.paymentHistory = user.payment_history?.data ?? [];
          this.paymentHistoryTotal = user.payment_history?.total_records ?? 0;
          this.paymentHistoryTotalPages = user.payment_history?.total_pages ?? 0;
          this.paymentHistoryCurrentPage = user.payment_history?.current_page ?? 1;
          this.patchUserForm(user);
        }
      }
    });

    this.actions$.pipe(
      ofType(updateUserSuccess, updateUserFailure),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hidePreloader();
    });
  }

  private patchUserForm(user: any): void {
    this.form.patchValue({
      full_name: user.full_name,
      email: user.email,
      phone_number: user.phone_number,
      date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().substring(0, 10) : '',
      is_minor: user.is_minor
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const changes = this.form.value;
    this.showPreloader();
    this.store.dispatch(updateUser({ id: this.userId, changes }));
  }

  private showPreloader(): void {
    try {
      const pre = document.getElementById('preloader');
      if (pre) {
        const el = pre as HTMLElement;
        el.style.display = 'block';
        el.style.opacity = '1';
        el.style.visibility = 'visible';
      }
      try { document.documentElement.setAttribute('data-preloader', 'enable'); } catch (e) { }
      this.loading = true;
    } catch (e) {
      this.loading = true;
    }
  }

  private hidePreloader(): void {
    try {
      const pre = document.getElementById('preloader');
      if (pre) {
        const el = pre as HTMLElement;
        el.style.opacity = '0';
        el.style.visibility = 'hidden';
        el.style.display = 'none';
      }
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }

  getInitials(name?: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openUserInNewTab(id: any): void {
    if (id) { window.open('/users/' + id, '_blank'); }
  }

  formatAmount(amount: any): string {
    if (amount === null || amount === undefined) return '-';
    const num = parseFloat(amount);
    return isNaN(num) ? String(amount) : '$' + num.toFixed(2);
  }

  onPaymentHistoryPageChange(page: number): void {
    if (page < 1 || page > this.paymentHistoryTotalPages || page === this.paymentHistoryCurrentPage) return;
    this.paymentHistoryLoading = true;
    const token = localStorage.getItem('token') || '';
    this.userService.getUserPaymentHistory(token, this.userId, page).subscribe({
      next: (data: any) => {
        this.paymentHistory = data?.payment_history?.data ?? [];
        this.paymentHistoryTotal = data?.payment_history?.total_records ?? this.paymentHistoryTotal;
        this.paymentHistoryTotalPages = data?.payment_history?.total_pages ?? this.paymentHistoryTotalPages;
        this.paymentHistoryCurrentPage = data?.payment_history?.current_page ?? page;
        this.paymentHistoryLoading = false;
      },
      error: () => { this.paymentHistoryLoading = false; }
    });
  }
}
