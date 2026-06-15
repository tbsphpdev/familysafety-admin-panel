import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Monitoring } from './monitoring.model';
import { MonitoringListResponse } from 'src/app/pages/monitoring/monitoring.service';

export const MonitoringActions = createActionGroup({
  source: 'Monitoring/API',
  events: {
    'Load Monitorings': props<{ monitorings: Monitoring[] }>(),
    'Add Monitoring': props<{ monitoring: Monitoring }>(),
    'Upsert Monitoring': props<{ monitoring: Monitoring }>(),
    'Add Monitorings': props<{ monitorings: Monitoring[] }>(),
    'Upsert Monitorings': props<{ monitorings: Monitoring[] }>(),
    'Update Monitoring': props<{ monitoring: Update<Monitoring> }>(),
    'Update Monitorings': props<{ monitorings: Update<Monitoring>[] }>(),
    'Delete Monitoring': props<{ id: string }>(),
    'Delete Monitorings': props<{ ids: string[] }>(),
    'Clear Monitorings': emptyProps(),
    'Load Payment History': props<{ page?: number; search?: string; perPage?: number; dateFrom?: string | null; dateTo?: string | null; ordering?: string }>(),
    'Load Payment History Success': props<{ response: MonitoringListResponse; pageSize: number }>(),
    'Load Payment History Failure': props<{ error: any }>(),
  }
});
