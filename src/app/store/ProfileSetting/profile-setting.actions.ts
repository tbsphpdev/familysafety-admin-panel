// FIX: Added createAction to the imports list
import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { ProfileSetting } from './profile-setting.model';

export const updateProfile = createAction('[Profile] Update Profile Request', props<{ userDetails: any }>());
export const updateProfileSuccess = createAction('[Profile] Update Profile Success', props<{ response: any }>());
export const updateProfileFailure = createAction('[Profile] Update Profile Failure', props<{ error: string }>());

export const changePassword = createAction('[Profile] Change Password Request', props<{ id: number, data: { password: string, new_password: string } }>());
export const changePasswordSuccess = createAction('[Profile] Change Password Success', props<{ response: any }>());
export const changePasswordFailure = createAction('[Profile] Change Password Failure', props<{ error: string }>());

export const uploadProfileImage = createAction('[Profile] Upload Profile Image Request', props<{ image: File }>());
export const uploadProfileImageSuccess = createAction('[Profile] Upload Profile Image Success', props<{ response: any }>());
export const uploadProfileImageFailure = createAction('[Profile] Upload Profile Image Failure', props<{ error: string }>());