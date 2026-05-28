import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { loadUser, updateUser, updateUserSuccess, updateUserFailure } from '../../../store/Users/user.actions';
import { selectEntities } from '../../../store/Users/user.reducer';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.scss'],
})
export class UserEditComponent implements OnInit {
  form!: FormGroup;
  userId!: number;
  loading = false;

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

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = Number(id);
        this.store.dispatch(loadUser({ id: this.userId }));
        this.store.select(selectEntities).subscribe((entities: any) => {
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
      }
    });

    this.actions$.pipe(ofType(updateUserSuccess, updateUserFailure)).subscribe(() => {
      this.loading = false;
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const changes = this.form.value;
    this.loading = true;
    this.store.dispatch(updateUser({ id: this.userId, changes }));
  }
}
