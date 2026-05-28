import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { SubscriptionEffects } from './subscription.effects';

describe('SubscriptionEffects', () => {
  let actions$: Observable<any>;
  let effects: SubscriptionEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SubscriptionEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(SubscriptionEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
