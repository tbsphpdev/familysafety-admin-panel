import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Subscription } from './subscription.model';
import {
  getSubscriptions,
  getSubscriptionsSuccess,
  getSubscriptionsFailure,
  SubscriptionActions
} from './subscription.actions';

export const subscriptionsFeatureKey = 'subscriptions';

// 1. State Definition with Loading & Error Tracking
export interface State extends EntityState<Subscription> {
  loading: boolean;
  error: any;
}

export type SubscriptionState = State;

// 2. Entity Adapter Configuration
export const adapter: EntityAdapter<Subscription> = createEntityAdapter<Subscription>();

// 3. Initial State with Defaults
export const initialState: State = adapter.getInitialState({
  loading: false,
  error: null
});

// 4. Reducer Logic
export const reducer = createReducer(
  initialState,

  // API Request Lifecycle Handlers
  on(getSubscriptions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(getSubscriptionsSuccess, (state, action) =>
    adapter.setAll(action.subscriptions, {
      ...state,
      loading: false,
      error: null
    })
  ),
  on(getSubscriptionsFailure, (state, action) => ({
    ...state,
    loading: false,
    error: action.error
  })),

  // Standard Entity Mutations via Action Group
  on(SubscriptionActions.addSubscription,
    (state, action) => adapter.addOne(action.subscription, state)
  ),
  on(SubscriptionActions.upsertSubscription,
    (state, action) => adapter.upsertOne(action.subscription, state)
  ),
  on(SubscriptionActions.addSubscriptions,
    (state, action) => adapter.addMany(action.subscriptions, state)
  ),
  on(SubscriptionActions.upsertSubscriptions,
    (state, action) => adapter.upsertMany(action.subscriptions, state)
  ),
  on(SubscriptionActions.updateSubscription,
    (state, action) => adapter.updateOne(action.subscription, state)
  ),
  on(SubscriptionActions.updateSubscriptions,
    (state, action) => adapter.updateMany(action.subscriptions, state)
  ),
  on(SubscriptionActions.deleteSubscription,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(SubscriptionActions.deleteSubscriptions,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(SubscriptionActions.clearSubscriptions,
    state => adapter.removeAll(state)
  )
);

export const subscriptionReducer = reducer;

// 5. Feature Selector Base
export const subscriptionsFeature = {
  name: subscriptionsFeatureKey,
  reducer,
  selectSubscriptionsState: (state: any) => state[subscriptionsFeatureKey] as SubscriptionState
};

// 6. Selectors Composition Layer
const subscriptionsSelectors = adapter.getSelectors(subscriptionsFeature.selectSubscriptionsState);

export const {
  selectIds,
  selectEntities,
  selectAll: selectAllSubscriptions,
  selectTotal,
} = subscriptionsSelectors;

// 7. Custom Selectors for Loading and Error flags
export const selectSubscriptionLoading = (state: any) =>
  subscriptionsFeature.selectSubscriptionsState(state)?.loading ?? false;

export const selectSubscriptionError = (state: any) =>
  subscriptionsFeature.selectSubscriptionsState(state)?.error ?? null;