import { createActionGroup, emptyProps, props, createAction } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Group } from './group.model';

export const GroupActions = createActionGroup({
  source: 'Group/API',
  events: {
    'Load Groups': props<{ groups: Group[] }>(),
    'Add Group': props<{ group: Group }>(),
    'Upsert Group': props<{ group: Group }>(),
    'Add Groups': props<{ groups: Group[] }>(),
    'Upsert Groups': props<{ groups: Group[] }>(),
    'Update Group': props<{ group: Update<Group> }>(),
    'Update Groups': props<{ groups: Update<Group>[] }>(),
    'Delete Group': props<{ id: string }>(),
    'Delete Groups': props<{ ids: string[] }>(),
    'Clear Groups': emptyProps(),
  }
});

// API actions for fetching groups list and single group
export const fetchGroups = createAction(
  '[Group] Fetch Groups',
  props<{ page?: number; per_page?: number; search?: string }>()
);

export const fetchGroupsSuccess = createAction(
  '[Group] Fetch Groups Success',
  props<{ groups: any[]; currentPage: number; totalPages: number; totalGroups: number }>()
);

export const fetchGroupsFailure = createAction(
  '[Group] Fetch Groups Failure',
  props<{ error: any }>()
);

export const getGroup = createAction(
  '[Group] Get Group',
  props<{ id: number }>()
);

export const getGroupSuccess = createAction(
  '[Group] Get Group Success',
  props<{ group: any }>()
);

export const getGroupFailure = createAction(
  '[Group] Get Group Failure',
  props<{ error: any }>()
);
