import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferralListComponent } from './referral-list.component';

describe('ReferralListComponent', () => {
  let component: ReferralListComponent;
  let fixture: ComponentFixture<ReferralListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferralListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferralListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
