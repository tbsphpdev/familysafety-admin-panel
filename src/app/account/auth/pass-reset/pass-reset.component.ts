import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { AuthfakeauthenticationService } from 'src/app/core/services/authfake.service';
import { sendOTP } from 'src/app/store/Authentication/authentication.actions';

@Component({
  selector: 'app-pass-reset',
  templateUrl: './pass-reset.component.html',
  styleUrls: ['./pass-reset.component.scss'],
  standalone: false
})

// Password Reset 
export class PassResetComponent {
  passwordRestForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  a: any = 10;
  b: any = 20;
  toast!: false;
  // set the currenr year
  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder,
    private router: Router,
    private store: Store,
  ) { }

  ngOnInit(): void {
    if (localStorage.getItem('currentUser')) {
      this.router.navigate(['/']);
    }
    /**
     * Form Validatyion
     */
    this.passwordRestForm = this.formBuilder.group({
      phone: ['', [Validators.required]]
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.passwordRestForm.controls; }

  sendOtp() {
    this.submitted = true;
    console.log("Debug 1 (Whole Form Value):", this.passwordRestForm.value);

    const phone = this.f['phone'].value;
    console.log("Component:: Phone number", phone);
    this.store.dispatch(sendOTP({ phone: phone }));
  }
}
