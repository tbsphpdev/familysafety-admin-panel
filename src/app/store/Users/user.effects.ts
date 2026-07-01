import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, map, concatMap, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { loadUsers, loadUsersSuccess, loadUsersFailure, userSuspend, userSuspendSuccess, userSuspendFailure, userUnsuspend, userUnsuspendSuccess, userUnsuspendFailure, deleteUser, deleteUserSuccess, deleteUserFailure } from './user.actions';
import { loadUser, loadUserSuccess, loadUserFailure, updateUser, updateUserSuccess, updateUserFailure } from './user.actions';
import { UserService } from '../../pages/users/user.service';

@Injectable()
export class UserEffects {
  private getEffectErrorMessage(error: any): string {
    if (!error) {
      return 'Request failed';
    }
    if (typeof error === 'string' && error.trim()) {
      return error;
    }
    if (error.message) {
      return error.message;
    }
    if (error.error) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return error.error;
      }
      if (error.error.message) {
        return error.error.message;
      }
    }
    if (error.status && error.statusText) {
      return `${error.status} ${error.statusText}`;
    }
    if (error.status) {
      return `Request failed with status ${error.status}`;
    }
    return 'Request failed';
  }

  loadUsers$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUsers),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const page = action && action.page ? action.page : 1;
        const perPage = action && action.per_page ? action.per_page : undefined;
        const search = action && action.search ? action.search : undefined;
        const ordering = action && action.ordering ? action.ordering : undefined;
        const is_minor = action?.is_minor;
        const status = action?.status;
        return this.userService.getUsers(token, page, search, perPage, ordering, is_minor, status).pipe(
          tap((data: any) => console.debug('[UserEffects] getUsers response:', data)),
          map((data: any) => loadUsersSuccess({
            users: (data && data.users) ? data.users : [],
            meta: {
              current_page: data && data.current_page ? data.current_page : 1,
              total_pages: data && data.total_pages ? data.total_pages : 1,
              total_users: data && data.total_users ? data.total_users : 0,
            }
          })),
          catchError((error) => of(loadUsersFailure({ error: this.getEffectErrorMessage(error) })))
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
        const currentPerPage = action && action.per_page ? action.per_page : undefined;
        const currentSearch = action && action.search ? action.search : undefined;
        const currentOrdering = action && action.ordering ? action.ordering : undefined;

        return this.userService.suspendUser(token, id).pipe(
          switchMap((res: any) => [
            userSuspendSuccess({ id, response: res }),
            loadUsers({ page: currentPage, per_page: currentPerPage, search: currentSearch, ordering: currentOrdering, is_minor: action?.is_minor, status: action?.status })
          ]),
          catchError((error) => of(userSuspendFailure({ error: this.getEffectErrorMessage(error) })))
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
        const currentPerPage = action && action.per_page ? action.per_page : undefined;
        const currentSearch = action && action.search ? action.search : undefined;
        const currentOrdering = action && action.ordering ? action.ordering : undefined;

        return this.userService.unsuspendUser(token, id).pipe(
          switchMap((res: any) => [
            userUnsuspendSuccess({ id, response: res }),
            loadUsers({ page: currentPage, per_page: currentPerPage, search: currentSearch, ordering: currentOrdering, is_minor: action?.is_minor, status: action?.status })
          ]),
          catchError((error) => of(userUnsuspendFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    )
  })

  deleteUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(deleteUser),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        return this.userService.deleteUser(token, action.id).pipe(
          switchMap(() => [
            deleteUserSuccess({ id: action.id }),
            loadUsers({ page: action.page, per_page: action.per_page, search: action.search, ordering: action.ordering, is_minor: action.is_minor, status: action.status })
          ]),
          catchError((error) => of(deleteUserFailure({ error: this.getEffectErrorMessage(error) })))
        );
      })
    );
  });

  loadUser$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(loadUser),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action && action.id ? action.id : null;
        return this.userService.getUser(token, id).pipe(
          map((data: any) => {
            const user = data && data.user ? data.user : data;
            return loadUserSuccess({ user: { ...user, payment_history: data?.payment_history ?? null } });
          }),
          catchError((error) => of(loadUserFailure({ error: this.getEffectErrorMessage(error) })))
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
          catchError((error) => of(updateUserFailure({ error: this.getEffectErrorMessage(error) })))
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
      ofType(loadUsersFailure, userSuspendFailure, userUnsuspendFailure, deleteUserFailure, loadUserFailure, updateUserFailure),
      tap((action: any) => {
        console.error('[UserEffects] API failure', action.error);
        try {
          this.toastr.error(this.getEffectErrorMessage(action.error), 'Error');
        } catch (e) { }
      })
    ), { dispatch: false }
  );
}

