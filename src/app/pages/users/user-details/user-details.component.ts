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
  userId!: number;
  loading = false;
  form!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router) { }

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
}
