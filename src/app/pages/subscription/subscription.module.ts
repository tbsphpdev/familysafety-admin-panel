import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';

import { SubscriptionRoutingModule } from './subscription-routing.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    SubscriptionRoutingModule
  ]
})
export class SubscriptionModule { }
