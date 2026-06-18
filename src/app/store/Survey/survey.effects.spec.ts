import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SurveyEffects } from './survey.effects';

describe('SurveyEffects', () => {
  let actions$: Observable<any>;
  let effects: SurveyEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SurveyEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(SurveyEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
