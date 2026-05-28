import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, concatMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { loadUsers, loadUsersSuccess, loadUsersFailure, userSuspend, userSuspendSuccess, userSuspendFailure, userUnsuspend, userUnsuspendSuccess, userUnsuspendFailure } from './user.actions';
import { loadUser, loadUserSuccess, loadUserFailure, updateUser, updateUserSuccess, updateUserFailure } from './user.actions';
import { UserService } from '../../pages/users/user.service';

@Injectable()
export class UserEffects {

  loadUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUsers),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const page = action && action.page ? action.page : 1;
        const search = action && action.search ? action.search : undefined;
        return this.userService.getUsers(token, page, search).pipe(
          tap((data: any) => console.debug('[UserEffects] getUsers response:', data)),
          map((data: any) => loadUsersSuccess({
            users: (data && data.users) ? data.users : [],
            meta: {
              current_page: data && data.current_page ? data.current_page : 1,
              total_pages: data && data.total_pages ? data.total_pages : 1,
              total_users: data && data.total_users ? data.total_users : 0,
            }
          })),
          catchError((error) => of(loadUsersFailure({ error })))
        )
      })
    );
  });

  userSuspend$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userSuspend),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;

        const currentPage = action && action.page ? action.page : 1;
        const currentSearch = action && action.search ? action.search : undefined;

        return this.userService.suspendUser(token, id).pipe(
          switchMap((res: any) => [
            userSuspendSuccess({ id, response: res }),
            loadUsers({ page: currentPage, search: currentSearch })
          ]),
          catchError((error) => of(userSuspendFailure({ error: error.message || error })))
        );
      })
    );
  });

  userUnsuspend$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(userUnsuspend),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;

        const currentPage = action && action.page ? action.page : 1;
        const currentSearch = action && action.search ? action.search : undefined;

        return this.userService.unsuspendUser(token, id).pipe(
          switchMap((res: any) => [
            userUnsuspendSuccess({ id, response: res }),
            loadUsers({ page: currentPage, search: currentSearch })
          ]),
          catchError((error) => of(userUnsuspendFailure({ error: error.message || error })))
        );
      })
    )
  })

  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUser),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;
        return this.userService.getUser(token, id).pipe(
          map((data: any) => loadUserSuccess({ user: data && data.user ? data.user : data })),
          catchError((error) => of(loadUserFailure({ error })))
        );
      })
    );
  });

  updateUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateUser),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;
        const changes = action && action.changes ? action.changes : {};
        return this.userService.updateUser(token, id, changes).pipe(
          map((res: any) => updateUserSuccess({ user: res && res.user ? res.user : res })),
          catchError((error) => of(updateUserFailure({ error })))
        );
      })
    );
  });


  constructor(private actions$: Actions, private userService: UserService, private router: Router, private toastr: ToastrService) { }

  updateUserSuccessRedirect$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateUserSuccess),
      map((action: any) => {
        try {
          this.toastr.success('User updated successfully', 'Success');
        } catch (e) { }
        try {
          this.router.navigate(['/users']);
        } catch (e) { }
      })
    ), { dispatch: false });

  logLoadUsersFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUsersFailure),
      tap((action: any) => console.error('[UserEffects] loadUsersFailure', action.error))
    ), { dispatch: false }
  );
}

