import { createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Subscription } from './subscription.model';
import {
  createSubscription,
  createSubscriptionFailure,
  createSubscriptionSuccess,
  deleteSubscription,
  deleteSubscriptionFailure,
  deleteSubscriptionSuccess,
  getLanguages,
  getLanguagesFailure,
  getLanguagesSuccess,
  getSubscription,
  getSubscriptionFailure,
  getSubscriptionSuccess,
  getSubscriptions,
  getSubscriptionsSuccess,
  getSubscriptionsFailure,
  statusChange,
  statusChangeFailure,
  statusChangeSuccess,
  SubscriptionActions,
  translateToAllLanguages,
  translateToAllLanguagesFailure,
  translateToAllLanguagesSuccess,
  updateSubscription,
  updateSubscriptionFailure,
  updateSubscriptionSuccess
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

  on(
    getSubscriptions,
    statusChange,
    createSubscription,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    getLanguages,
    translateToAllLanguages,
    SubscriptionActions.updateSubscription,
    (state) => ({
    ...state,
    loading: true,
    error: null
    })
  ),
  on(getSubscriptionsSuccess, (state, action) => {
    // Safely extract the array if your listing endpoint wraps data in an envelope: { data: [...] }
    const listData = (action as any).subscriptions?.data ? (action as any).subscriptions.data : action.subscriptions;
    return adapter.setAll(listData, {
      ...state,
      loading: false,
      error: null
    });
  }),
  on(
    getSubscriptionsFailure,
    statusChangeFailure,
    createSubscriptionFailure,
    getSubscriptionFailure,
    updateSubscriptionFailure,
    deleteSubscriptionFailure,
    getLanguagesFailure,
    translateToAllLanguagesFailure,
    SubscriptionActions.updateSubscriptionFailure,
    (state, action) => ({
    ...state,
    loading: false,
    error: action.error
    })
  ),

  on(
    statusChangeSuccess,
    createSubscriptionSuccess,
    updateSubscriptionSuccess,
    getLanguagesSuccess,
    translateToAllLanguagesSuccess,
    (state) => ({
      ...state,
      loading: false,
      error: null
    })
  ),

  // 2. Fetch Single Record Success Handler
  on(getSubscriptionSuccess, SubscriptionActions.getSubscriptionSuccess, (state, action) => {
    const subscriptionData = action.subscription?.data ? action.subscription.data : action.subscription;
    return adapter.upsertOne(subscriptionData, {
      ...state,
      loading: false,
      error: null
    });
  }),

  // 3. Update Mutation Handlers (FIXED)
  on(updateSubscriptionSuccess, SubscriptionActions.updateSubscriptionSuccess, (state, action) => {
    const updatedData = action.subscription?.data ? action.subscription.data : action.subscription;

    if (!updatedData || !updatedData.id) {
      return { ...state, loading: false };
    }

    return adapter.updateOne(
      { id: updatedData.id, changes: updatedData },
      {
        ...state,
        loading: false,
        error: null
      }
    );
  }),

  on(deleteSubscriptionSuccess, (state, action) =>
    adapter.removeOne(action.id, {
      ...state,
      loading: false,
      error: null
    })
  ),

  // 4. Standard Secondary Entity Mutations
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
  on(SubscriptionActions.updateSubscriptions,
    (state, action) => adapter.updateMany(action.subscriptions, state)
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
