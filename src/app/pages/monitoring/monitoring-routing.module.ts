import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReferralListComponent } from './referral-list/referral-list.component';
import { GeoFenceEventsComponent } from './geo-fence-events/geo-fence-events.component';
import { SosAlertsListComponent } from './sos-alerts-list/sos-alerts-list.component';
import { SosAlertMapComponent } from './sos-alert-map/sos-alert-map.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';

const routes: Routes = [
  { path: 'referral-list', component: ReferralListComponent },
  { path: 'geofence-logs', component: GeoFenceEventsComponent },
  { path: 'sos-alerts', component: SosAlertsListComponent },
  { path: 'sos-alerts/map', component: SosAlertMapComponent },
  { path: 'payment-history', component: PaymentHistoryComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonitoringRoutingModule { }
