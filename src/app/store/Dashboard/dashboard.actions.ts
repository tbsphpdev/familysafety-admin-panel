import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Dashboard } from './dashboard.model';

export const DashboardActions = createActionGroup({
  source: 'Dashboard/API',
  events: {
    'Load Dashboard': emptyProps(),
    'Load Dashboard Success': props<{ dashboard: Dashboard }>(),
    'Load Dashboard Failure': props<{ error: string }>(),
  }
});
