import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectEntities } from 'src/app/store/Subscription/subscription.reducer';
import { getSubscription, getSubscriptionSuccess, getSubscriptionFailure, updateSubscription, getLanguages, getLanguagesSuccess, getLanguagesFailure, translateToAllLanguages, translateToAllLanguagesSuccess, translateToAllLanguagesFailure } from 'src/app/store/Subscription/subscription.actions';
import { ListStateService } from 'src/app/core/services/list-state.service';

@Component({
  selector: 'app-subscription-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './subscription-edit.component.html',
  styleUrl: './subscription-edit.component.scss',
})
export class SubscriptionEditComponent implements OnDestroy {
  breadCrumbItems!: Array<{ label: string; active?: boolean }>;

  subscriptions: any[] = [];
  loading: boolean = false;
  editForm!: FormGroup;
  subscriptionId!: number;
  language: any;
  languages: any[] = [];
  selectedLanguage: string = 'en';
  private destroy$ = new Subject<void>();

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private store: Store, private actions$: Actions, private listState: ListStateService) { }

  ngOnInit(): void {
    this.editForm = this.fb.group({
      lang: [this.selectedLanguage, [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: ['', [Validators.required, Validators.min(0)]],
      interval: ['monthly', [Validators.required]],
      description: ['', []],
      plan_sku: ['', []],
      apple_product_id: ['', []],
      google_product_id: ['', []],
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

    this.fetchLanguages();

    this.actions$.pipe(
      ofType(getLanguagesSuccess),
      takeUntil(this.destroy$)
    ).subscribe((action: any) => {
      this.languages = Array.isArray(action.languages) ? action.languages : [];
      const defaultLang = this.languages.find((lang: any) => lang.code === 'en')?.code || this.languages[0]?.code || '';
      if (defaultLang) {
        this.selectedLanguage = defaultLang;
      }
      this.loadSubscription(this.selectedLanguage);
    });

    this.actions$.pipe(
      ofType(getLanguagesFailure),
      takeUntil(this.destroy$)
    ).subscribe((action: any) => {
      console.error('Failed to load languages', action.error);
    });

    this.route.paramMap.pipe(
      takeUntil(this.destroy$)
    ).subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.subscriptionId = Number(id);
        this.loadSubscription(this.selectedLanguage);
      }
    });

    this.store.select(selectEntities).pipe(
      takeUntil(this.destroy$)
    ).subscribe((entities: any) => {
      const rawSubscription = entities && entities[this.subscriptionId] ? entities[this.subscriptionId] : null;
      const subscription = rawSubscription?.data ? rawSubscription.data : rawSubscription;

      if (subscription) {
        this.editForm.patchValue({
          name: subscription.name,
          price: subscription.price,
          interval: this.normalizeInterval(subscription.interval),
          description: subscription.description,
          plan_sku: subscription.plan_sku || '',
          apple_product_id: subscription.apple_product_id || '',
          google_product_id: subscription.google_product_id || '',
          max_groups: subscription.limits?.max_groups,
          max_members_per_group: subscription.limits?.max_members_per_group,
          max_safe_zones: subscription.limits?.max_safe_zones,
          location_history_days: subscription.limits?.location_history_days,
          offline_support: subscription.limits?.offline_support !== undefined ? String(subscription.limits.offline_support) : 'false',
          family_dashboard: subscription.limits?.family_dashboard !== undefined ? String(subscription.limits.family_dashboard) : 'false',
          max_family_members: subscription.limits?.max_family_members
        });
        this.editForm.updateValueAndValidity();

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
      ofType(getSubscriptionSuccess),
      takeUntil(this.destroy$)
    ).subscribe((action: any) => {
      console.log('Subscription loaded successfully', action);
      const subscription = action.subscription?.data ? action.subscription.data : action.subscription;
      if (subscription && Number(subscription.id) === Number(this.subscriptionId)) {
        this.patchSubscriptionForm(subscription);
      }
      this.hidePreloader();
    });

    this.actions$.pipe(
      ofType(getSubscriptionFailure),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hidePreloader();
    });

    this.actions$.pipe(
      ofType(translateToAllLanguagesSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hidePreloader();
    });

    this.actions$.pipe(
      ofType(translateToAllLanguagesFailure),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.hidePreloader();
    });
  }

  private patchSubscriptionForm(subscription: any): void {
    this.editForm.patchValue({
      name: subscription.name,
      price: subscription.price,
      interval: this.normalizeInterval(subscription.interval),
      description: subscription.description,
      plan_sku: subscription.plan_sku || '',
      apple_product_id: subscription.apple_product_id || '',
      google_product_id: subscription.google_product_id || '',
      max_groups: subscription.limits?.max_groups,
      max_members_per_group: subscription.limits?.max_members_per_group,
      max_safe_zones: subscription.limits?.max_safe_zones,
      location_history_days: subscription.limits?.location_history_days,
      offline_support: subscription.limits?.offline_support !== undefined ? String(subscription.limits.offline_support) : 'false',
      family_dashboard: subscription.limits?.family_dashboard !== undefined ? String(subscription.limits.family_dashboard) : 'false',
      max_family_members: subscription.limits?.max_family_members
    });
    this.editForm.updateValueAndValidity();

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

  onSubmit(): void {
    if (this.editForm.invalid) {
      return;
    }
    this.showPreloader();
    const formValue = this.editForm.value;

    const formattedFeatures = (formValue.features || [])
      .filter((f: any) => f.feature_name && f.feature_name.trim() !== '')
      .map((f: any, index: number) => ({
        id: f.id ? Number(f.id) : null,
        feature_name: f.feature_name.trim(),
        order: index + 1,
        subscription: Number(this.subscriptionId)
      }));

    const payload = {
      lang: this.selectedLanguage,
      name: formValue.name,
      price: String(formValue.price),
      description: formValue.description || '',
      interval: formValue.interval === 'year' ? 'year' : 'month',
      is_active: true,
      plan_sku: formValue.plan_sku || '',
      apple_product_id: formValue.apple_product_id || '',
      google_product_id: formValue.google_product_id || '',
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

    const listState = this.listState.getState('subscriptions');
    this.store.dispatch(updateSubscription({
      id: this.subscriptionId,
      payload,
      page: listState.page,
      per_page: listState.per_page,
      search: listState.search || ''
    }));
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

  fetchLanguages(): void {
    this.store.dispatch(getLanguages());
  }

  onLanguageChange(languageId: any): void {
    this.selectedLanguage = String(languageId);
    this.loadSubscription(this.selectedLanguage);
  }

  private loadSubscription(language?: string): void {
    if (!this.subscriptionId) {
      return;
    }
    this.showPreloader();
    this.store.dispatch(getSubscription({ id: this.subscriptionId, language: language }));
  }

  private normalizeInterval(interval: any): string {
    if (interval === 'month') {
      return 'monthly';
    }
    return interval;
  }

  translateToAllLanguages(): void {
    this.showPreloader();
    this.store.dispatch(translateToAllLanguages({ id: this.subscriptionId }));
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
