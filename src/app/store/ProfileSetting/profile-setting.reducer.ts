import { createFeature, createReducer, on } from '@ngrx/store';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ProfileSetting } from './profile-setting.model';
import { ProfileSettingActions } from './profile-setting.actions';

export const profileSettingsFeatureKey = 'profileSettings';

export interface State extends EntityState<ProfileSetting> {
  // additional entities state properties
}

export const adapter: EntityAdapter<ProfileSetting> = createEntityAdapter<ProfileSetting>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export const reducer = createReducer(
  initialState,
  on(ProfileSettingActions.addProfileSetting,
    (state, action) => adapter.addOne(action.profileSetting, state)
  ),
  on(ProfileSettingActions.upsertProfileSetting,
    (state, action) => adapter.upsertOne(action.profileSetting, state)
  ),
  on(ProfileSettingActions.addProfileSettings,
    (state, action) => adapter.addMany(action.profileSettings, state)
  ),
  on(ProfileSettingActions.upsertProfileSettings,
    (state, action) => adapter.upsertMany(action.profileSettings, state)
  ),
  on(ProfileSettingActions.updateProfileSetting,
    (state, action) => adapter.updateOne(action.profileSetting, state)
  ),
  on(ProfileSettingActions.updateProfileSettings,
    (state, action) => adapter.updateMany(action.profileSettings, state)
  ),
  on(ProfileSettingActions.deleteProfileSetting,
    (state, action) => adapter.removeOne(action.id, state)
  ),
  on(ProfileSettingActions.deleteProfileSettings,
    (state, action) => adapter.removeMany(action.ids, state)
  ),
  on(ProfileSettingActions.loadProfileSettings,
    (state, action) => adapter.setAll(action.profileSettings, state)
  ),
  on(ProfileSettingActions.clearProfileSettings,
    state => adapter.removeAll(state)
  ),
);

export const profileSettingsFeature = createFeature({
  name: profileSettingsFeatureKey,
  reducer,
  extraSelectors: ({ selectProfileSettingsState }) => ({
    ...adapter.getSelectors(selectProfileSettingsState)
  }),
});

export const {
  selectIds,
  selectEntities,
  selectAll,
  selectTotal,
} = profileSettingsFeature;
