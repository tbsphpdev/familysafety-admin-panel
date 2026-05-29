import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { createSubscription } from 'src/app/store/Subscription/subscription.actions';

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
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      interval: ['monthly', [Validators.required]],
      description: ['', []],
      max_groups: ['', []],
      max_members_per_group: ['', []],
      max_safe_zones: ['', []],
      location_history_days: ['', []],
      offline_support: ['false', []],
      family_dashboard: ['false', []],
      max_family_members: ['', []],
      features: this.fb.array([])
    });

    this.breadCrumbItems = [
      { label: 'Subscription' },
      { label: 'Create', active: true }
    ];

    this.addFeature();
  }

  onSubmit(): void {
    if (this.createForm.invalid) {
      return;
    }

    const formValue = this.createForm.value;

    const formattedFeatures = (formValue.features || [])
      .filter((f: string) => f && f.trim() !== '')
      .map((f: string) => ({ name: f.trim() }));

    const payload = {
      name: formValue.name,
      price: String(formValue.price),
      description: formValue.description || '',
      interval: formValue.interval === 'yearly' ? 'year' : 'month',
      is_active: true,
      features: formattedFeatures,
      limits: {
        max_groups: Number(formValue.max_groups) || null,
        max_members_per_group: Number(formValue.max_members_per_group) || null,
        max_safe_zones: Number(formValue.max_safe_zones) || null,
        location_history_days: Number(formValue.location_history_days) || null,
        offline_support: formValue.offline_support === 'true' || formValue.offline_support === true,
        family_dashboard: formValue.family_dashboard === 'true' || formValue.family_dashboard === true,
        max_family_members: Number(formValue.max_family_members) || null
      }
    };

    this.store.dispatch(createSubscription({ payload: payload }));
  }

  get features(): FormArray {
    return this.createForm.get('features') as FormArray;
  }

  // Appends a new blank field row at the bottom
  addFeature(): void {
    this.features.push(this.fb.control('', [Validators.required]));
  }

  // Removes the specific row index clicked
  removeFeature(index: number): void {
    this.features.removeAt(index);
  }
}
