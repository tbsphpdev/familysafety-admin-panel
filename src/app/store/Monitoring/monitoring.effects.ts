import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MonitoringActions } from './monitoring.actions';
import { MonitoringService } from 'src/app/pages/monitoring/monitoring.service';


@Injectable()
export class MonitoringEffects {

  loadPaymentHistory$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(MonitoringActions.loadPaymentHistory),
      concatMap(({ page, search, perPage, dateFrom, dateTo, ordering }) => {
        const filterParams: { [key: string]: string } = {
          per_page: String(perPage || 10)
        };
        if (dateFrom) {
          filterParams['date_from'] = dateFrom;
        }
        if (dateTo) {
          filterParams['date_to'] = dateTo;
        }
        if (ordering) {
          filterParams['ordering'] = ordering;
        }
        return this.monitoringService.getPaymentHistory(page, search, filterParams).pipe(
          map(response => MonitoringActions.loadPaymentHistorySuccess({ response, pageSize: perPage || 10 })),
          catchError(error => of(MonitoringActions.loadPaymentHistoryFailure({ error })))
        );
      })
    );
  });


  constructor(private actions$: Actions, private monitoringService: MonitoringService) {}
}
