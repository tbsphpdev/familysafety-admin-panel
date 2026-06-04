import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap } from 'rxjs/operators';
import { Observable, EMPTY, of } from 'rxjs';
import { MonitoringActions } from './monitoring.actions';


@Injectable()
export class MonitoringEffects {

  yMonitorings$ = createEffect(() => {
    return this.actions$.pipe(

      ofType(MonitoringActions.yMonitorings),
      concatMap(() =>
        /** An EMPTY observable only emits completion. Replace with your own observable API request */
        EMPTY.pipe(
          map(data => MonitoringActions.yMonitoringsSuccess({ data })),
          catchError(error => of(MonitoringActions.yMonitoringsFailure({ error }))))
      )
    );
  });


  constructor(private actions$: Actions) {}
}
