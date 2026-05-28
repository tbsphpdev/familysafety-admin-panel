import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { passChange } from 'src/app/store/Authentication/authentication.actions';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pass-change',
  templateUrl: './pass-change.component.html',
  styleUrls: ['./pass-change.component.scss'],
  standalone: false
})

// Password Chage Component
export class PassChangeComponent {
  phone: string = '';
  passChangeForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  fieldTextType1!: boolean;
  error = '';
  returnUrl!: string;
  a: any = 10;
  b: any = 20;
  toast!: false;
  // set the currenr year
  year: number = new Date().getFullYear();

  constructor(private router: Router, private formBuilder: UntypedFormBuilder, private store: Store, private toastr: ToastrService) {
    // 1. Read the transferred navigation state safely in the constructor
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.phone = navigation.extras.state['phone'];
    }
  }

  ngOnInit(): void {
    this.passChangeForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    });

    if (!this.phone) {
      this.router.navigate(['/auth/pass-reset']);
    }
  }

  /**
 * Password Hide/Show
 */
  toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

  toggleFieldTextType1() {
    this.fieldTextType1 = !this.fieldTextType1;
  }

  passChangeSubmit(event?: Event) {
    this.submitted = true;

    const phone = this.phone;
    const password = this.passChangeForm.get('password')?.value;
    const confirmPassword = this.passChangeForm.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      this.error = 'Passwords do not match';
      this.toastr.error(this.error, 'Error');
      return;
    }
    this.store.dispatch(passChange({ phone: phone, password: password }));
  }
}
