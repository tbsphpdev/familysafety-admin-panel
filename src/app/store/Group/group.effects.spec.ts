import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { GroupEffects } from './group.effects';

describe('GroupEffects', () => {
  let actions$: Observable<any>;
  let effects: GroupEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GroupEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(GroupEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
