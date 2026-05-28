import { createAction, createActionGroup, emptyProps, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { User } from './user.model';

// API actions for loading users
export const loadUsers = createAction('[Users] Load Users', props<{ page?: number, search?: string }>());
export const loadUsersSuccess = createAction('[Users] Load Users Success', props<{ users: User[], meta?: { current_page?: number, total_pages?: number, total_users?: number } }>());
export const loadUsersFailure = createAction('[Users] Load Users Failure', props<{ error: any }>());
export const userSuspend = createAction('[Users] User Suspend', props<{ id: string, page: number, search?: string }>());
export const userSuspendSuccess = createAction('[Users] User Suspend Success', props<{ id: any, response: any }>());
export const userSuspendFailure = createAction('[Users] User Suspend Failure', props<{ error: any }>());
export const userUnsuspend = createAction('[Users] User Unsuspend', props<{ id: string, page: number, search?: string }>());
export const userUnsuspendSuccess = createAction('[Users] User Unsuspend Success', props<{ id: any, response: any }>());
export const userUnsuspendFailure = createAction('[Users] User Unsuspend Failure', props<{ error: any }>());

// Single user load/update actions
export const loadUser = createAction('[Users] Load User', props<{ id: number }>());
export const loadUserSuccess = createAction('[Users] Load User Success', props<{ user: User }>());
export const loadUserFailure = createAction('[Users] Load User Failure', props<{ error: any }>());

export const updateUser = createAction('[Users] Update User API', props<{ id: number, changes: Partial<User> }>());
export const updateUserSuccess = createAction('[Users] Update User Success', props<{ user: User }>());
export const updateUserFailure = createAction('[Users] Update User Failure', props<{ error: any }>());

export const UserActions = createActionGroup({
  source: 'User/Entities',
  events: {
    'Add User': props<{ user: User }>(),
    'Upsert User': props<{ user: User }>(),
    'Add Users': props<{ users: User[] }>(),
    'Upsert Users': props<{ users: User[] }>(),
    'Update User': props<{ user: Update<User> }>(),
    'Update Users': props<{ users: Update<User>[] }>(),
    'Delete User': props<{ id: string }>(),
    'Delete Users': props<{ ids: string[] }>(),
    'Clear Users': emptyProps(),
  }
});
