import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, tap, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import {
  getSubscriptions,
  getSubscriptionsFailure,
  getSubscriptionsSuccess,
  statusChange,
  statusChangeSuccess,
  statusChangeFailure,
  createSubscription,
  createSubscriptionSuccess,
  createSubscriptionFailure,
  getSubscription,
  getSubscriptionSuccess,
  getSubscriptionFailure,
  updateSubscription,
  updateSubscriptionSuccess,
  updateSubscriptionFailure,
  deleteSubscription,
  deleteSubscriptionSuccess,
  deleteSubscriptionFailure,
  getLanguages,
  getLanguagesSuccess,
  getLanguagesFailure,
  translateToAllLanguages,
  translateToAllLanguagesSuccess,
  translateToAllLanguagesFailure
} from './subscription.actions';
import { SubscriptionService } from '../../pages/subscription/subscription.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable()
export class SubscriptionEffects {

  getSubscriptions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getSubscriptions),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const params = {
          page: action.page,
          per_page: action.per_page,
          search: action.search
        };

        return this.subscriptionService.getSubscriptions(token, params).pipe(
          map((data: any) => getSubscriptionsSuccess({
            subscriptions: this.getSubscriptionsFromResponse(data),
          })),
          catchError((error) => of(getSubscriptionsFailure({ error })))
        );
      })
    );
  });

  logGetSubscriptionsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getSubscriptionsFailure),
      tap((action: any) => {
        console.error('[SubscriptionEffects] getSubscriptionsFailure', action.error);
        try {
          this.toastr.error(this.getEffectErrorMessage(action.error), 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  constructor(private actions$: Actions, private subscriptionService: SubscriptionService, private toastr: ToastrService, private router: Router) { }

  private getSubscriptionsFromResponse(data: any): any[] {
    if (data && Array.isArray(data.subscriptions)) {
      return data.subscriptions;
    }

    if (data && Array.isArray(data.subscription)) {
      return data.subscription;
    }

    if (data && Array.isArray(data.data)) {
      return data.data;
    }

    if (Array.isArray(data)) {
      return data;
    }

    return [];
  }

  private getEffectErrorMessage(error: any): string {
    if (!error) {
      return 'Request failed';
    }
    if (typeof error === 'string' && error.trim()) {
      return error;
    }
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
    }
    if (error.status && error.statusText) {
      return `${error.status} ${error.statusText}`;
    }
    if (error.status) {
      return `Request failed with status ${error.status}`;
    }
    return 'Request failed';
  }

  statusChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(statusChange),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;

        return this.subscriptionService.suspendUser(token, id).pipe(
          switchMap((res: any) => [
            statusChangeSuccess({ response: res }),
            getSubscriptions({ page: action.page, per_page: action.per_page, search: action.search })
          ]),
          catchError((error) => of(statusChangeFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  statusChangeSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(statusChangeSuccess),
      tap((action: any) => {
        try {
          this.toastr.success('Subscription status updated successfully', 'Success');
        } catch (e) { }
      })
    ), { dispatch: false }
  )

  statusChangeFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(statusChangeFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to change subscription status', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  createSubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createSubscription),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const payload = action && action.payload ? action.payload : null;

        return this.subscriptionService.createSubscription(token, payload).pipe(
          switchMap((res: any) => [
            createSubscriptionSuccess({ response: res, page: action.page, per_page: action.per_page, search: action.search }),
            getSubscriptions({ page: action.page, per_page: action.per_page, search: action.search })
          ]),
          catchError((error) => of(createSubscriptionFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  createSubscriptionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createSubscriptionSuccess),
      tap((action: any) => {
        try {
          this.toastr.success('Subscription created successfully', 'Success');
          this.router.navigate(['/subscription']);
        } catch (e) {
          console.error(e);
        }
      })
    ),
    { dispatch: false }
  );

  createSubscriptionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(createSubscriptionFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to create subscription', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  )

  getSubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getSubscription),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;
        const language = action && action.language ? action.language : undefined;

        return this.subscriptionService.getSubscription(token, id, language).pipe(
          map((subscription: any) => {
            const payload = subscription?.data ? subscription.data : subscription;
            if (!payload || payload.id == null) {
              throw new Error('Invalid subscription response');
            }
            return getSubscriptionSuccess({ subscription });
          }),
          catchError((error) => of(getSubscriptionFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  getSubscriptionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getSubscriptionFailure),
      tap((action: any) => {
        try {
          this.toastr.error(this.getEffectErrorMessage(action.error), 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  updateSubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateSubscription),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;
        const payload = action && action.payload ? action.payload : null;

        return this.subscriptionService.updateSubscription(token, id, payload).pipe(
          switchMap((res: any) => [
            updateSubscriptionSuccess({ subscription: res, page: action.page, per_page: action.per_page, search: action.search }),
            getSubscriptions({ page: action.page, per_page: action.per_page, search: action.search })
          ]),
          catchError((error) => of(updateSubscriptionFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  updateSubscriptionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateSubscriptionSuccess),
      tap((action: any) => {
        try {
          this.toastr.success('Subscription updated successfully', 'Success');
          this.router.navigate(['/subscription']);
        } catch (e) {
          console.error(e);
        }
      })
    ),
    { dispatch: false }
  );

  updateSubscriptionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateSubscriptionFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to update subscription', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  )

  deleteSubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteSubscription),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;

        return this.subscriptionService.deleteSubscription(token, id).pipe(
          switchMap((res: any) => [
            deleteSubscriptionSuccess({ success: res, id, page: action.page, per_page: action.per_page, search: action.search }),
            getSubscriptions({ page: action.page, per_page: action.per_page, search: action.search })
          ]),
          catchError((error) => of(deleteSubscriptionFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  deleteSubscriptionSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteSubscriptionSuccess),
      tap((action: any) => {
        try {
          this.toastr.success('Subscription deleted successfully', 'Success');
          this.router.navigate(['/subscription']);
        } catch (e) {
          console.error(e);
        }
      })
    ),
    { dispatch: false }
  );

  deleteSubscriptionFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(deleteSubscriptionFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to delete subscription', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  )

  getLanguages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getLanguages),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';

        return this.subscriptionService.getLanguages(token).pipe(
          switchMap((res: any) => {
            const languages = Array.isArray(res) ? res : res?.data ?? res?.languages ?? [];
            return [
              getLanguagesSuccess({ languages: languages })
            ];
          }),
          catchError((error) => of(getLanguagesFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  getLanguagesFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getLanguagesFailure),
      tap((action: any) => {
        try {
          this.toastr.error(this.getEffectErrorMessage(action.error), 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  translateToAllLanguages$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(translateToAllLanguages),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;

        return this.subscriptionService.translateToAllLanguages(token, id).pipe(
          switchMap((res: any) => {
            const languages = Array.isArray(res) ? res : res?.data ?? res?.languages ?? [];
            return [
              translateToAllLanguagesSuccess({ success: languages })
            ];
          }),
          catchError((error) => of(translateToAllLanguagesFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  translateToAllLanguagesSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(translateToAllLanguagesSuccess),
      tap((action: any) => {
        try {
          this.toastr.success('Translated to all languages successfully', 'Success');
        } catch (e) {
          console.error(e);
        }
      })
    ),
    { dispatch: false }
  );

  translateToAllLanguagesFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(translateToAllLanguagesFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to translate all languages', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );
}
