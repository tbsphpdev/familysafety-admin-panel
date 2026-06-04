import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { User } from './user.model';
import { UserActions, } from './user.actions';
import {
  loadUser,
  loadUserFailure,
  loadUsers,
  loadUsersFailure,
  loadUsersSuccess,
  loadUserSuccess,
  updateUser,
  updateUserFailure,
  updateUserSuccess,
  userSuspend,
  userSuspendFailure,
  userSuspendSuccess,
  userUnsuspend,
  userUnsuspendFailure,
  userUnsuspendSuccess
} from './user.actions';

export const usersFeatureKey = 'users';

export interface State extends EntityState<User> {
  // pagination metadata
  currentPage?: number;
  totalPages?: number;
  totalUsers?: number;
  loading: boolean;
  error: any;
}

export type UserState = State;

export const adapter: EntityAdapter<User> = createEntityAdapter<User>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  currentPage: 1,
  totalPages: 1,
  totalUsers: 0,
  loading: false,
  error: null,
});

export const reducer = createReducer(
  initialState,
  on(
    loadUsers,
    userSuspend,
    userUnsuspend,
    loadUser,
    updateUser,
    (state) => ({
      ...state,
      loading: true,
      error: null
    })
  ),
  on(UserActions.addUser,
    (state, action) => adapter.addOne(action.user, state)
  ),
  on(UserActions.upsertUser,
    (state, action) => adapter.upsertOne(action.user, state)
  ),
  on(UserActions.addUsers,
    (state, action) => adapter.addMany(action.users, state)
  ),
  on(UserActions.upsertUsers,
    (state, action) => adapter.upsertMany(action.users, state)
  ),
  on(UserActions.updateUser,
    (state, action) => adapter.updateOne(action.user, state)
  ),
  on(UserActions.updateUsers,
    (state, action) => adapter.updateMany(action.users, state)
  ),
  on(UserActions.deleteUser,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(UserActions.deleteUsers,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(loadUsersSuccess,
    (state, action) => adapter.setAll(action.users, {
      ...state,
      currentPage: action.meta && action.meta.current_page ? action.meta.current_page : state.currentPage,
      totalPages: action.meta && action.meta.total_pages ? action.meta.total_pages : state.totalPages,
      totalUsers: action.meta && action.meta.total_users ? action.meta.total_users : state.totalUsers,
      loading: false,
      error: null,
    })
  ),
  on(loadUserSuccess,
    (state, action) => adapter.upsertOne(action.user, {
      ...state,
      loading: false,
      error: null
    })
  ),
  on(updateUserSuccess,
    (state, action) => adapter.upsertOne(action.user, {
      ...state,
      loading: false,
      error: null
    })
  ),
  on(
    userSuspendSuccess,
    userUnsuspendSuccess,
    (state) => ({
      ...state,
      loading: false,
      error: null
    })
  ),
  on(
    loadUsersFailure,
    userSuspendFailure,
    userUnsuspendFailure,
    loadUserFailure,
    updateUserFailure,
    (state, action) => ({
      ...state,
      loading: false,
      error: action.error
    })
  ),
  on(UserActions.clearUsers,
    state => adapter.removeAll(state)
  ),
);

export const userReducer = reducer;

// Provide a simple feature descriptor to access the users state slice
export const usersFeature = {
  name: usersFeatureKey,
  reducer,
  selectUsersState: (state: any) => state[usersFeatureKey]
};

const usersSelectors = adapter.getSelectors(usersFeature.selectUsersState as any as any);
export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = usersSelectors;

// Simple metadata selectors (use with `store.select(selectCurrentPage)`)
export const selectUsersMeta = (state: any) => state[usersFeatureKey] as UserState;
export const selectCurrentPage = (state: any) => (selectUsersMeta(state) && selectUsersMeta(state).currentPage) || 1;
export const selectTotalPages = (state: any) => (selectUsersMeta(state) && selectUsersMeta(state).totalPages) || 1;
export const selectTotalUsers = (state: any) => (selectUsersMeta(state) && selectUsersMeta(state).totalUsers) || 0;
export const selectUsersLoading = (state: any) => (selectUsersMeta(state) && selectUsersMeta(state).loading) || false;
export const selectUsersError = (state: any) => (selectUsersMeta(state) && selectUsersMeta(state).error) || null;
