import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { loadUser, updateUser, updateUserSuccess, updateUserFailure } from '../../../store/Users/user.actions';
import { selectEntities } from '../../../store/Users/user.reducer';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  userId!: number;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      date_of_birth: [''],
      is_minor: [false],
      is_verified: [false]
    });

    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
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
        this.form.patchValue({
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number,
          date_of_birth: user.date_of_birth,
          is_minor: user.is_minor,
          is_verified: user.is_verified
        });
      }
    });

    this.actions$.pipe(ofType(updateUserSuccess, updateUserFailure), takeUntil(this.destroy$)).subscribe(() => {
      this.hidePreloader();
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const changes = this.form.value;
    this.showPreloader();
    this.store.dispatch(updateUser({ id: this.userId, changes }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
}
