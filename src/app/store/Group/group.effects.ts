import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, concatMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { GroupActions, fetchGroups, fetchGroupsSuccess, fetchGroupsFailure, getGroup, getGroupSuccess, getGroupFailure } from './group.actions';
import { GroupService } from 'src/app/pages/group/group.service';
import { ToastrService } from 'ngx-toastr';


@Injectable()
export class GroupEffects {

  fetchGroups$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(fetchGroups),
      concatMap((action: any) =>
        this.groupService.getGroups(action.page ?? 1, action.search ?? '', action.per_page ?? 10).pipe(
          switchMap((res: any) => [
            GroupActions.loadGroups({ groups: res.groups }),
            fetchGroupsSuccess({ groups: res.groups, currentPage: res.currentPage, totalPages: res.totalPages, totalGroups: res.totalGroups })
          ]),
          catchError((error) => of(fetchGroupsFailure({ error })))
        )
      )
    );
  });

  getGroup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getGroup),
      concatMap((action: any) =>
        this.groupService.getGroup(action.id).pipe(
          map((group: any) => getGroupSuccess({ group })),
          catchError((error) => of(getGroupFailure({ error })))
        )
      )
    )
  );

  fetchGroupsFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchGroupsFailure),
      tap((action: any) => {
        try {
          this.toastr.error(action.error || 'Failed to load groups', 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );

  getGroupFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(getGroupFailure),
      tap((action: any) => {
        if (action.error) {
          try {
            this.toastr.error(action.error, 'Error');
          } catch (e) { }
        }
      })
    ), { dispatch: false }
  );

  constructor(private actions$: Actions, private groupService: GroupService, private toastr: ToastrService) { }
}
