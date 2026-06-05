import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { updateProfile, updateProfileSuccess, updateProfileFailure, changePassword, changePasswordSuccess, changePasswordFailure, uploadProfileImage, uploadProfileImageSuccess, uploadProfileImageFailure } from './profile-setting.actions';
import { ProfileSettingsService } from '../../pages/extrapages/profile-settings/profile-settings.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from '../../../environments/environment';
import { EventService } from '../../core/services/event.service';


@Injectable()
export class ProfileSettingEffects {

  constructor(private actions$: Actions, private ProfileSettingsService: ProfileSettingsService, private toastr: ToastrService, private eventService: EventService) { }

  profileUpdate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(updateProfile),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const userDetails = action.userDetails;
        return this.ProfileSettingsService.updateProfile(token, userDetails).pipe(
          map((res: any) => updateProfileSuccess({ response: res && res.user ? res.user : res })),
          catchError((error) => of(updateProfileFailure({
            error: this.getErrorMessage(error, 'Failed to update profile')
          })))
        );
      })
    );
  })

  updateProfileSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProfileSuccess),
      tap((action: any) => {
        const jsonResponse = action.response?.data || action.response;
        try {
          if (jsonResponse) {
            localStorage.setItem('currentUser', JSON.stringify(jsonResponse));
            this.eventService.broadcast('currentUserUpdated', jsonResponse);
            const newProfile = jsonResponse.profile_picture;
            if (newProfile) {
              document.querySelectorAll('.header-profile-user, #user-img').forEach((element: any) => {
                element.src = newProfile;
              });
            }
          }
          this.toastr.success('Profile updated successfully', 'Success');
        } catch (e) { }
      })
    ), {
    dispatch: false
  });

  updateProfileFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateProfileFailure),
      tap((action: any) => {
        this.toastr.error(action.error || 'Failed to update profile', 'Error');
      })
    ), {
    dispatch: false
  });

  changePassword$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(changePassword),
      concatMap((action: any) => {
        const token = localStorage.getItem('token') || '';
        const id = action.id;
        const data = action.data;
        return this.ProfileSettingsService.changePassword(token, id, data).pipe(
          map((res: any) => changePasswordSuccess({ response: res })),
          catchError((error) => of(changePasswordFailure({
            error: this.getErrorMessage(error, 'Failed to change password')
          })))
        );
      })
    );
  })

  changePasswordSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changePasswordSuccess),
      tap(() => {
        try {
          this.toastr.success('Password changed successfully', 'Success');
        } catch (e) { }
      })
    ), {
    dispatch: false
  });

  changePasswordFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(changePasswordFailure),
      tap((action: any) => {
        this.toastr.error(action.error || 'Failed to change password', 'Error');
      })
    ), {
    dispatch: false
  });

  uploadProfileImage$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(uploadProfileImage),
      concatMap((action: any) => {
        const fileData = action.image;

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userId = currentUser.id;
        const oldAvatarUrl = currentUser.profile_picture;

        return this.ProfileSettingsService.uploadProfileImage(fileData).pipe(
          concatMap((res: any) => {
            const newUrl = res.url;

            if (oldAvatarUrl && oldAvatarUrl.includes(environment.digitalOceanSpaces.cdnBase)) {
              return this.ProfileSettingsService.deleteImageFromSpace(oldAvatarUrl).pipe(
                map(() => updateProfile({ userDetails: { profile_picture: newUrl } })),
                catchError(() => {
                  console.warn('Failed to clean up old bucket image, moving on...');
                  return of(updateProfile({ userDetails: { profile_picture: newUrl } }));
                })
              );
            }

            return of(updateProfile({ userDetails: { profile_picture: newUrl } }));
          }),
          catchError((error) => of(uploadProfileImageFailure({
            error: this.getErrorMessage(error, 'Failed to update profile image')
          })))
        );
      })
    );
  });

  uploadProfileImageFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(uploadProfileImageFailure),
      tap((action: any) => {
        this.toastr.error(action.error || 'Failed to upload profile image', 'Error');
      })
    ), {
    dispatch: false
  });

  private getErrorMessage(error: any, fallback: string): string {
    if (typeof error === 'string') {
      return error;
    }

    const responseError = error?.error;
    if (typeof responseError === 'string') {
      return responseError;
    }

    if (responseError?.message) {
      return responseError.message;
    }

    if (responseError?.error) {
      return responseError.error;
    }

    if (error?.message) {
      return error.message;
    }

    return fallback;
  }
}
