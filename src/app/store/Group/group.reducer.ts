import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { Group } from './group.model';
import { GroupActions, fetchGroups, fetchGroupsSuccess, fetchGroupsFailure, getGroupSuccess, getGroupFailure } from './group.actions';

export const groupsFeatureKey = 'groups';

export interface State extends EntityState<Group> {
  // additional entities state properties
  currentPage?: number;
  totalPages?: number;
  totalGroups?: number;
  pageSize?: number;
  loading?: boolean;
  error?: any;
  selectedItem?: any | null;
}

export const adapter: EntityAdapter<Group> = createEntityAdapter<Group>();

export const initialState: State = adapter.getInitialState({
  currentPage: 1,
  totalPages: 1,
  totalGroups: 0,
  pageSize: 10,
  loading: false,
  error: null,
  selectedItem: null
});

export const reducer = createReducer(
  initialState,
  on(GroupActions.addGroup,
    (state, action) => adapter.addOne(action.group, state)
  ),
  on(GroupActions.upsertGroup,
    (state, action) => adapter.upsertOne(action.group, state)
  ),
  on(GroupActions.addGroups,
    (state, action) => adapter.addMany(action.groups, state)
  ),
  on(GroupActions.upsertGroups,
    (state, action) => adapter.upsertMany(action.groups, state)
  ),
  on(GroupActions.updateGroup,
    (state, action) => adapter.updateOne(action.group, state)
  ),
  on(GroupActions.updateGroups,
    (state, action) => adapter.updateMany(action.groups, state)
  ),
  on(GroupActions.deleteGroup,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(GroupActions.deleteGroups,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(GroupActions.clearGroups,
    state => adapter.removeAll(state)
  ),
  // API flow
  on(fetchGroups, (state, action: any) => ({
    ...state,
    loading: true,
    error: null,
    pageSize: action.per_page ?? state.pageSize
  })),
  on(fetchGroupsSuccess, (state, action: any) => {
    const newState = adapter.setAll(action.groups || [], state);
    return {
      ...newState,
      currentPage: action.currentPage,
      totalPages: action.totalPages,
      totalGroups: action.totalGroups,
      loading: false,
      error: null,
      selectedItem: state.selectedItem
    };
  }),
  on(fetchGroupsFailure, (state, action: any) => ({
    ...state,
    loading: false,
    error: action.error
  })),
  on(getGroupSuccess, (state, action: any) => ({
    ...adapter.upsertOne(action.group, state),
    selectedItem: action.group,
    error: null
  })),
  on(getGroupFailure, (state, action: any) => ({
    ...state,
    selectedItem: null,
    error: action.error
  })),
);

export const groupsFeature = {
  name: groupsFeatureKey,
  reducer,
  selectGroupsState: (state: any) => state[groupsFeatureKey]
};

const groupsSelectors = adapter.getSelectors(groupsFeature.selectGroupsState as any);
export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = groupsSelectors;

const selectGroupsMeta = (state: any): State => state[groupsFeatureKey];

export const selectGroupsItems = (state: any) => selectGroupsMeta(state) ? selectGroupsMeta(state).ids.map((id: any) => selectGroupsMeta(state).entities[id]) : [];
export const selectGroupsCurrentPage = (state: any) => selectGroupsMeta(state)?.currentPage || 1;
export const selectGroupsTotalPages = (state: any) => selectGroupsMeta(state)?.totalPages || 1;
export const selectGroupsTotalGroups = (state: any) => selectGroupsMeta(state)?.totalGroups || 0;
export const selectGroupsPageSize = (state: any) => selectGroupsMeta(state)?.pageSize || 10;
export const selectGroupsLoading = (state: any) => selectGroupsMeta(state)?.loading || false;
export const selectGroupsError = (state: any) => selectGroupsMeta(state)?.error || null;
export const selectGroupsSelectedItem = (state: any) => selectGroupsMeta(state)?.selectedItem || null;
