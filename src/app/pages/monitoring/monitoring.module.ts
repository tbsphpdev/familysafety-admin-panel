import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MonitoringRoutingModule } from './monitoring-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ReferralListComponent } from './referral-list/referral-list.component';
import { GeoFenceEventsComponent } from './geo-fence-events/geo-fence-events.component';
import { SosAlertsListComponent } from './sos-alerts-list/sos-alerts-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    GeoFenceEventsComponent,
    SosAlertsListComponent,
    ReferralListComponent,
    MonitoringRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MonitoringModule { }
