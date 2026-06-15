import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { createSubscription, createSubscriptionSuccess, createSubscriptionFailure } from 'src/app/store/Subscription/subscription.actions';
import { ListStateService } from 'src/app/core/services/list-state.service';

@Component({
  selector: 'app-subscription-create',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscription-create.component.html',
  styleUrl: './subscription-create.component.scss',
})
export class SubscriptionCreateComponent implements OnInit, OnDestroy {
  breadCrumbItems!: Array<{ label: string; active?: boolean }>;

  subscriptions: any[] = [];
  loading: boolean = false;
  createForm!: FormGroup;
  private destroy$ = new Subject<void>();
  currentPage = 1;
  pageSize = 10;
  searchTerm = '';

  constructor(public store: Store, private fb: FormBuilder, private actions$: Actions, private listState: ListStateService) { }

  ngOnInit(): void {
    this.actions$.pipe(
      ofType(createSubscriptionSuccess, createSubscriptionFailure),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hidePreloader();
    });
    this.createForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
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

    const savedState = this.listState.getState('subscriptions');
    this.currentPage = savedState.page;
    this.pageSize = savedState.per_page;
    this.searchTerm = savedState.search || '';

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

    this.showPreloader();
    const formValue = this.createForm.value;

    const formattedFeatures = (formValue.features || [])
      .filter((f: string) => f && f.trim() !== '')
      .map((f: string) => ({ feature_name: f.trim() }));

    const payload = {
      name: formValue.name,
      price: String(formValue.price),
      description: formValue.description || '',
      interval: formValue.interval === 'year' ? 'year' : 'month',
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

    this.store.dispatch(createSubscription({
      payload,
      page: this.currentPage,
      per_page: this.pageSize,
      search: this.searchTerm
    }));
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
      document.documentElement.setAttribute('data-preloader', 'enable');
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
      document.documentElement.removeAttribute('data-preloader');
      this.loading = false;
    } catch (e) {
      this.loading = false;
    }
  }
}
