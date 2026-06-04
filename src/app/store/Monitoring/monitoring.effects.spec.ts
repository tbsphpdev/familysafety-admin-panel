import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { MonitoringEffects } from './monitoring.effects';

describe('MonitoringEffects', () => {
  let actions$: Observable<any>;
  let effects: MonitoringEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MonitoringEffects,
        provideMockActions(() => actions$)
      ]
    });

    effects = TestBed.inject(MonitoringEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
