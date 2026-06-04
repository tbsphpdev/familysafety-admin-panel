import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SosAlertsListComponent } from './sos-alerts-list.component';

describe('SosAlertsListComponent', () => {
  let component: SosAlertsListComponent;
  let fixture: ComponentFixture<SosAlertsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SosAlertsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SosAlertsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
