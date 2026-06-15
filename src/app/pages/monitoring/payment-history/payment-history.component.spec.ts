import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentHistoryComponent } from './payment-history.component';
import { MonitoringService } from '../monitoring.service';
import { ToastrService } from 'ngx-toastr';

describe('PaymentHistoryComponent', () => {
  let component: PaymentHistoryComponent;
  let fixture: ComponentFixture<PaymentHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryComponent],
      providers: [
        {
          provide: MonitoringService,
          useValue: {
            getPaymentHistory: () => of({
              items: [],
              current_page: 1,
              total_pages: 1,
              total_items: 0
            })
          }
        },
        {
          provide: ToastrService,
          useValue: {
            error: () => undefined
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
