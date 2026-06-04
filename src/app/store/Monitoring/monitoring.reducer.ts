import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Monitoring } from './monitoring.model';
import { MonitoringActions } from './monitoring.actions';

export const monitoringsFeatureKey = 'monitorings';

export interface State extends EntityState<Monitoring> {
  // additional entities state properties
}

export const adapter: EntityAdapter<Monitoring> = createEntityAdapter<Monitoring>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
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
} = monitoringsFeature;
