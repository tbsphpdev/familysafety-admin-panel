import { Injectable, Inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, exhaustMap, tap } from 'rxjs/operators';
import { from, of } from 'rxjs';
import { AuthenticationService } from '../../core/services/auth.service';
import { login, loginSuccess, loginFailure, logout, logoutSuccess, Register, sendOTP, sendOTPSuccess, sendOTPFailure, verifyOTP, verifyOTPSuccess, verifyOTPFailure, passChange, passChangeSuccess, passChangeFailure } from './authentication.actions';
import { Router } from '@angular/router';

@Injectable()
export class AuthenticationEffects {

  Register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(Register),
      exhaustMap(({ email, first_name, password }) =>
        this.AuthenticationService.register(email, first_name, password).pipe(
          map((user) => {
            this.router.navigate(['/auth/login']);
            return loginSuccess({ user });
          }),
          catchError((error) => of(loginFailure({ error })))
        )
      )
    )
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ email, password }) =>
        this.AuthenticationService.login(email, password).pipe(
          map((user) => {
            console.log(user);

            if (user.status == 200) {
              localStorage.setItem('currentUser', JSON.stringify(user.data));
              localStorage.setItem('token', user.access_token);
              this.router.navigate(['/']);
            }
            return loginSuccess({ user });
          }),
          catchError((error) => of(loginFailure({ error })))
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      tap(() => {
        // Perform any necessary cleanup or side effects before logging out
      }),
      exhaustMap(() => of(logoutSuccess()))
    )
  );

  sendOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendOTP),
      exhaustMap(({ phone }) => {
        return this.AuthenticationService.sendOTP(phone).pipe(
          map((response) => sendOTPSuccess({ response, phone })),
          catchError((error) => of(sendOTPFailure({ error: error.message || error })))
        );
      })
    )
  );

  sendOTPSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendOTPSuccess),
      tap((action: any) => {
        const phoneNumber = action.phone || '';
        this.router.navigate(['/auth/verify-otp'], {
          state: { phone: phoneNumber }
        });
      })
    ),
    { dispatch: false }
  );

  verifyOTP$ = createEffect(() =>
    this.actions$.pipe(
      ofType(verifyOTP),
      exhaustMap(({ phone, otp }) => {
        return this.AuthenticationService.verifyOTP(phone, otp).pipe(
          map((response) => {
            return verifyOTPSuccess({ response, phone });
          }),
          catchError((error) => of(verifyOTPFailure({ error: error.message || error })))
        );
      })
    )
  );

  verifyOTPSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(verifyOTPSuccess),
      tap((action: any) => {
        const phoneNumber = action.phone || '';
        this.router.navigate(['/auth/pass-change'], {
          state: { phone: phoneNumber }
        });
      })
    ),
    { dispatch: false }
  )

  passChange$ = createEffect(() =>
    this.actions$.pipe(
      ofType(passChange),
      exhaustMap(({ phone, password }) => {
        return this.AuthenticationService.passChange(phone, password).pipe(
          map((response) => {
            return passChangeSuccess({ response });
          }),
          catchError((error) => of(passChangeFailure({ error: error.message || error })))
        );
      })
    )
  );

  passChangeSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(passChangeSuccess),
      tap((action: any) => {

        this.router.navigate(['/auth/login']);
      })
    ),
    { dispatch: false }
  )

  constructor(
    @Inject(Actions) private actions$: Actions,
    private AuthenticationService: AuthenticationService,
    private router: Router) { }

}