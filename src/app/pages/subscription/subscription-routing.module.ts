import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { SubscriptionCreateComponent } from './subscription-create/subscription-create.component';
import { SubscriptionEditComponent } from './subscription-edit/subscription-edit.component';

const routes: Routes = [
  {
    path: '',
    component: SubscriptionListComponent
  },
  {
    path: 'create',
    component: SubscriptionCreateComponent
  },
  {
    path: 'edit/:id',
    component: SubscriptionEditComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionRoutingModule { }
