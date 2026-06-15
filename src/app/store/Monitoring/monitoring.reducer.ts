import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Monitoring } from './monitoring.model';
import { MonitoringActions } from './monitoring.actions';

export const monitoringsFeatureKey = 'monitorings';

export interface State extends EntityState<Monitoring> {
  paymentHistory: any[];
  paymentHistoryCurrentPage: number;
  paymentHistoryTotalPages: number;
  paymentHistoryTotalItems: number;
  paymentHistoryPageSize: number;
  paymentHistoryLoading: boolean;
  paymentHistoryError: any;
}

export const adapter: EntityAdapter<Monitoring> = createEntityAdapter<Monitoring>();

export const initialState: State = adapter.getInitialState({
  paymentHistory: [],
  paymentHistoryCurrentPage: 1,
  paymentHistoryTotalPages: 1,
  paymentHistoryTotalItems: 0,
  paymentHistoryPageSize: 10,
  paymentHistoryLoading: false,
  paymentHistoryError: null,
});

export const reducer = createReducer(
  initialState,
  on(MonitoringActions.addMonitoring,
    (state, action) => adapter.addOne(action.monitoring, state)
  ),
  on(MonitoringActions.upsertMonitoring,
    (state, action) => adapter.upsertOne(action.monitoring, state)
  ),
  on(MonitoringActions.addMonitorings,
    (state, action) => adapter.addMany(action.monitorings, state)
  ),
  on(MonitoringActions.upsertMonitorings,
    (state, action) => adapter.upsertMany(action.monitorings, state)
  ),
  on(MonitoringActions.updateMonitoring,
    (state, action) => adapter.updateOne(action.monitoring, state)
  ),
  on(MonitoringActions.updateMonitorings,
    (state, action) => adapter.updateMany(action.monitorings, state)
  ),
  on(MonitoringActions.deleteMonitoring,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(MonitoringActions.deleteMonitorings,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(MonitoringActions.loadMonitorings,
    (state, action) => adapter.setAll(action.monitorings, state)
  ),
  on(MonitoringActions.clearMonitorings,
    state => adapter.removeAll(state)
  ),
  on(MonitoringActions.loadPaymentHistory,
    (state) => ({
      ...state,
      paymentHistoryLoading: true,
      paymentHistoryError: null
    })
  ),
  on(MonitoringActions.loadPaymentHistorySuccess,
    (state, action) => ({
      ...state,
      paymentHistory: action.response.items,
      paymentHistoryCurrentPage: action.response.current_page,
      paymentHistoryTotalItems: action.response.total_items,
      paymentHistoryTotalPages: Math.max(action.response.total_pages, Math.ceil(action.response.total_items / action.pageSize) || 1),
      paymentHistoryPageSize: action.pageSize,
      paymentHistoryLoading: false,
      paymentHistoryError: null
    })
  ),
  on(MonitoringActions.loadPaymentHistoryFailure,
    (state, action) => ({
      ...state,
      paymentHistoryLoading: false,
      paymentHistoryError: action.error
    })
  ),
);

export const monitoringsFeature = createFeature({
  name: monitoringsFeatureKey,
  reducer,
  extraSelectors: ({ selectMonitoringsState }) => ({
    ...adapter.getSelectors(selectMonitoringsState)
  }),
});

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
  selectPaymentHistory,
  selectPaymentHistoryCurrentPage,
  selectPaymentHistoryTotalPages,
  selectPaymentHistoryTotalItems,
  selectPaymentHistoryPageSize,
  selectPaymentHistoryLoading,
  selectPaymentHistoryError,
} = monitoringsFeature;
