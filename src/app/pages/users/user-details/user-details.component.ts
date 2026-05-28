import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { loadUser, updateUser, updateUserSuccess, updateUserFailure } from '../../../store/Users/user.actions';
import { selectEntities } from '../../../store/Users/user.reducer';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-details.component.html',
  styleUrl: './user-details.component.scss',
})
export class UserDetailsComponent {
  userdetails: any = null;
  subscriptionDetails: any = null;
  userId!: number;
  loading = false;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.userId = Number(id);
        this.store.dispatch(loadUser({ id: this.userId }));
        this.store.select(selectEntities).subscribe((entities: any) => {
          const user = entities && entities[this.userId] ? entities[this.userId] : null;
          if (user) {
            this.userdetails = user;
            this.subscriptionDetails = user?.user_subs || null;
            console.log("Subscription Details:", this.subscriptionDetails);
          }
        });
      }
    });

  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
