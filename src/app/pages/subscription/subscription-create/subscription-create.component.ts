import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-subscription-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscription-create.component.html',
  styleUrl: './subscription-create.component.scss',
})
export class SubscriptionCreateComponent {
  breadCrumbItems!: Array<{ label: string; active?: boolean }>;

  subscriptions: any[] = [];
  loading: boolean = false;
  createForm!: FormGroup;

  constructor(public store: Store, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.createForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      is_minor: [false]
    });

    this.breadCrumbItems = [
      { label: 'Subscription' },
      { label: 'Create', active: true }
    ];
  }

  onSubmit(): void {
    if (this.createForm.valid) {
      const formData = this.createForm.value;
      console.log('Form Data:', formData);
      // Dispatch an action to create the subscription using the form data
      // this.store.dispatch(createSubscription({ subscription: formData }));
    } else {
      console.log('Form is invalid');
    }
  }
}
