import { createAction, props } from '@ngrx/store';
import { User } from './auth.models';
import { create } from 'lodash';
import { ex } from 'node_modules/@fullcalendar/core/internal-common';

// Register action
export const Register = createAction('[Authentication] Register', props<{ email: string, first_name: string, password: string }>());
export const RegisterSuccess = createAction('[Authentication] Register Success', props<{ user: User }>());
export const RegisterFailure = createAction('[Authentication] Register Failure', props<{ error: string }>());

// login action
export const login = createAction('[Authentication] Login', props<{ email: string, password: string }>());
export const loginSuccess = createAction('[Authentication] Login Success', props<{ user: User }>());
export const loginFailure = createAction('[Authentication] Login Failure', props<{ error: string }>());

// logout action
export const logout = createAction('[Authentication] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

export const sendOTP = createAction('[Authentication] Send OTP', props<{ phone: string }>());
export const sendOTPSuccess = createAction('[Authentication] Send OTP Success', props<{ response: any; phone: string }>());
export const sendOTPFailure = createAction('[Authentication] Send OTP Failure', props<{ error: string }>());

export const verifyOTP = createAction('[Authentication] Verify OTP', props<{ phone: string, otp: string }>());
export const verifyOTPSuccess = createAction('[Authentication] Verify OTP Success', props<{ response: any; phone: string }>());
export const verifyOTPFailure = createAction('[Authentication] Verify OTP Failure', props<{ error: string }>());

export const passChange = createAction('[Authentication] Password Change', props<{ phone: string, password: string }>());
export const passChangeSuccess = createAction('[Authentication] Password Change Success', props<{ response: any; }>());
export const passChangeFailure = createAction('[Authentication] Password Change Failure', props<{ error: string }>());
