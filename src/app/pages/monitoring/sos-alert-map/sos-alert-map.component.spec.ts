import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SosAlertMapComponent } from './sos-alert-map.component';

describe('SosAlertMapComponent', () => {
  let component: SosAlertMapComponent;
  let fixture: ComponentFixture<SosAlertMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SosAlertMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SosAlertMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
