import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { SubscriptionCreateComponent } from './subscription-create/subscription-create.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionListComponent
  },
  {
    path: 'create',
    component: SubscriptionCreateComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
