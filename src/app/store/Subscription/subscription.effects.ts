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
  updateSubscriptionFailure
} from './subscription.actions';
import { SubscriptionService } from '../../pages/subscription/subscription.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable()
export class SubscriptionEffects {

  getSubscriptions$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getSubscriptions),
      concatMap(() => {
        const token = localStorage.getItem('token') || '';

        return this.subscriptionService.getSubscriptions(token).pipe(
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
      tap((action: any) => console.error('[SubscriptionEffects] getSubscriptionsFailure', action.error))
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

  statusChange$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(statusChange),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;

        return this.subscriptionService.suspendUser(token, id).pipe(
          switchMap((res: any) => [
            statusChangeSuccess({ response: res }),
            getSubscriptions()
          ]),
          catchError((error) => of(statusChangeFailure({ error: error.message || error })))
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

  statusChangeFailure$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(statusChangeFailure),
      tap((action: any) => {
        try {
          this.toastr.error('Failed to change subscription status', 'Error');
        } catch (e) { }
      })
    )
  });

  createSubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createSubscription),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const payload = action && action.payload ? action.payload : null;

        return this.subscriptionService.createSubscription(token, payload).pipe(
          switchMap((res: any) => [
            createSubscriptionSuccess({ response: res }),
            getSubscriptions()
          ]),
          catchError((error) => of(createSubscriptionFailure({ error: error.message || error })))
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

  createSubscriptionFailure$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(createSubscriptionFailure),
      tap((action: any) => {
        try {
          this.toastr.error('Failed to create subscription', 'Error');
        } catch (e) { }
      })
    )
  })

  getSubscription$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(getSubscription),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;

        return this.subscriptionService.getSubscription(token, id).pipe(
          map((subscription: any) => getSubscriptionSuccess({ subscription })),
          catchError((error) => of(getSubscriptionFailure({ error: error.message || error })))
        );
      })
    );
  });
}
