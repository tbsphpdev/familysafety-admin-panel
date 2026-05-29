import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Subscription } from './subscription.model';

export const getSubscriptions = createAction('[Subscription] Get Subscriptions');
export const getSubscriptionsSuccess = createAction('[Subscription] Get Subscriptions Success', props<{ subscriptions: Subscription[] }>());
export const getSubscriptionsFailure = createAction('[Subscription] Get Subscriptions Failure', props<{ error: any }>());

export const statusChange = createAction('[Subscription] Status Change', props<{ id: string }>());
export const statusChangeSuccess = createAction('[Subscription] Status Change Success', props<{ response: any }>());
export const statusChangeFailure = createAction('[Subscription] Status Change Failure', props<{ error: any }>());

export const createSubscription = createAction('[Subscription] Create Subscription', props<{ payload: any }>());
export const createSubscriptionSuccess = createAction('[Subscription] Create Subscription Success', props<{ response: any }>());
export const createSubscriptionFailure = createAction('[Subscription] Create Subscription Failure', props<{ error: any }>());

export const getSubscription = createAction('[Subscription] Get Subscription', props<{ id: any }>());
export const getSubscriptionSuccess = createAction('[Subscription] Get Subscription Success', props<{ subscription: Subscription }>());
export const getSubscriptionFailure = createAction('[Subscription] Get Subscription Failure', props<{ error: any }>());

export const updateSubscription = createAction('[Subscription] Update Subscription', props<{ id: any; payload: any }>());
export const updateSubscriptionSuccess = createAction('[Subscription] Update Subscription Success', props<{ subscription: Subscription }>());
export const updateSubscriptionFailure = createAction('[Subscription] Update Subscription Failure', props<{ error: any }>());

export const SubscriptionActions = createActionGroup({
  source: 'Subscription',
  events: {
    'Load Subscriptions': props<{ subscriptions: Subscription[] }>(),
    'Add Subscription': props<{ subscription: Subscription }>(),
    'Upsert Subscription': props<{ subscription: Subscription }>(),
    'Add Subscriptions': props<{ subscriptions: Subscription[] }>(),
    'Upsert Subscriptions': props<{ subscriptions: Subscription[] }>(),
    'Update Subscription': props<{ subscription: Update<Subscription> }>(),
    'Update Subscriptions': props<{ subscriptions: Update<Subscription>[] }>(),
    'Delete Subscription': props<{ id: string }>(),
    'Delete Subscriptions': props<{ ids: string[] }>(),
    'Clear Subscriptions': emptyProps(),
    'Get Subscription': props<{ id: number }>(),
    'Get Subscription Success': props<{ subscription: any }>(),
    'Get Subscription Failure': props<{ error: any }>(),
  }
});