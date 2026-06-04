import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoFenceEventsComponent } from './geo-fence-events.component';

describe('GeoFenceEventsComponent', () => {
  let component: GeoFenceEventsComponent;
  let fixture: ComponentFixture<GeoFenceEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeoFenceEventsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeoFenceEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
