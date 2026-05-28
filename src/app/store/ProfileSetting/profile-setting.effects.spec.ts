import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ProfileSettingEffects } from './profile-setting.effects';

describe('ProfileSettingEffects', () => {
  let actions$: Observable<any>;
  let effects: ProfileSettingEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileSettingEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(ProfileSettingEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
