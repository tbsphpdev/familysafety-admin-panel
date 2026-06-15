import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DashboardService } from 'src/app/pages/dashboards/dashboard.service';
import { DashboardActions } from './dashboard.actions';


@Injectable()
export class DashboardEffects {

  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard),
      mergeMap(() =>
        this.dashboardService.getDashboard().pipe(
          map((response) => DashboardActions.loadDashboardSuccess({ dashboard: response.data })),
          catchError((error) => of(DashboardActions.loadDashboardFailure({ error: error?.message || error?.statusText || 'Failed to load dashboard' })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dashboardService: DashboardService
  ) { }
}
