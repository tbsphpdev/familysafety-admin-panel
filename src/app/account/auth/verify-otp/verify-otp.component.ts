import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { verifyOTP } from 'src/app/store/Authentication/authentication.actions';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.scss',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class VerifyOtpComponent {
  phone: string = '';
  verifyOtpForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  a: any = 10;
  b: any = 20;
  toast!: false;
  // set the currenr year
  year: number = new Date().getFullYear();

  constructor(private router: Router, private formBuilder: UntypedFormBuilder, private store: Store) {
    // 1. Read the transferred navigation state safely in the constructor
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.phone = navigation.extras.state['phone'];
    }
  }

  ngOnInit(): void {
    this.verifyOtpForm = this.formBuilder.group({
      otp: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    console.log('Loaded Verify OTP page for phone:', this.phone);

    if (!this.phone) {
      this.router.navigate(['/auth/pass-reset']);
    }
  }

  get f() { return this.verifyOtpForm.controls; }

  verifyOtpSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.submitted = true;

    const otp = this.f['otp'].value;
    const phone = this.phone;
    console.log("Component:: opt", otp);
    console.log("Component:: Phone number", phone);
    this.store.dispatch(verifyOTP({ phone: phone, otp: otp }));
  }
}
