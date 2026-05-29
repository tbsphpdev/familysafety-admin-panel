import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { ActivatedRoute, Router } from '@angular/router';
import { selectEntities } from 'src/app/store/Subscription/subscription.reducer';
import { getSubscription, getSubscriptionSuccess, getSubscriptionFailure, updateSubscription } from 'src/app/store/Subscription/subscription.actions';

@Component({
  selector: 'app-subscription-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscription-edit.component.html',
  styleUrl: './subscription-edit.component.scss',
})
export class SubscriptionEditComponent {
  breadCrumbItems!: Array<{ label: string; active?: boolean }>;

  subscriptions: any[] = [];
  loading: boolean = false;
  editForm!: FormGroup;
  subscriptionId!: number;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private router: Router) { }

  ngOnInit(): void {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      interval: ['monthly', [Validators.required]],
      description: ['', []],
      max_groups: ['', []],
      max_members_per_group: ['', []],
      max_safe_zones: ['', []],
      location_history_days: ['', []],
      offline_support: [false, []],
      family_dashboard: [false, []],
      max_family_members: ['', []],
      features: this.fb.array([])
    });

    this.breadCrumbItems = [
      { label: 'Subscription' },
      { label: 'Edit', active: true }
    ];

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.subscriptionId = Number(id);
        this.loading = true;
        this.store.dispatch(getSubscription({ id: this.subscriptionId }));
      }
    });

    this.store.select(selectEntities).subscribe((entities: any) => {
      const rawSubscription = entities && entities[this.subscriptionId] ? entities[this.subscriptionId] : null;
      const subscription = rawSubscription?.data ? rawSubscription.data : rawSubscription;

      if (subscription) {
        this.editForm.patchValue({
          name: subscription.name,
          price: subscription.price,
          interval: subscription.interval,
          description: subscription.description,
          max_groups: subscription.limits?.max_groups,
          max_members_per_group: subscription.limits?.max_members_per_group,
          max_safe_zones: subscription.limits?.max_safe_zones,
          location_history_days: subscription.limits?.location_history_days,
          offline_support: subscription.limits?.offline_support,
          family_dashboard: subscription.limits?.family_dashboard,
          max_family_members: subscription.limits?.max_family_members
        });

        this.features.clear();

        if (subscription.features && Array.isArray(subscription.features)) {
          subscription.features.forEach((f: any, index: number) => {
            this.addFeature(f.id, f.feature_name, f.order || (index + 1));
          });
        }

        if (this.features.length === 0) {
          this.addFeature(null, '', 1);
        }
      }
    });

    this.actions$.pipe(
      ofType(getSubscriptionSuccess, getSubscriptionFailure)
    ).subscribe(() => {
      this.loading = false;
    });
  }

  onSubmit(): void {
    if (this.editForm.invalid) {
      return;
    }

    const formValue = this.editForm.value;

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

    // this.store.dispatch(createSubscription({ payload: payload }));
  }

  get features(): FormArray {
    return this.editForm.get('features') as FormArray;
  }

  // Appends a new blank field row at the bottom
  addFeature(featureId: number | null = null, name: string = '', orderIndex: number = 1): void {
    this.features.push(
      this.fb.group({
        id: [featureId],
        feature_name: [name, [Validators.required]],
        order: [orderIndex]
      })
    );
  }

  // Removes the specific row index clicked
  removeFeature(index: number): void {
    this.features.removeAt(index);
  }
}
