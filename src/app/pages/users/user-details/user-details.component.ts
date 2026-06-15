import { Component, OnDestroy } from '@angular/core';
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
  imports: [CommonModule, RouterModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent implements OnDestroy {
  userdetails: any = null;
  subscriptionDetails: any = null;
  userId!: number;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router) { }

  ngOnInit(): void {
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
      const user = entities && entities[this.userId] ? entities[this.userId] : null;
      if (user) {
        this.userdetails = user;
        this.subscriptionDetails = user?.user_subs || null;
        console.log("Subscription Details:", this.subscriptionDetails);
      }
    });
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
}
