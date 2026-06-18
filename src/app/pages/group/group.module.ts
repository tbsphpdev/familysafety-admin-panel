import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

import { GroupRoutingModule } from './group-routing.module';
import { FormsModule } from '@angular/forms';
import { GroupListComponent } from './group-list/group-list.component';
import { reducer, groupsFeatureKey } from 'src/app/store/Group/group.reducer';
import { GroupEffects } from 'src/app/store/Group/group.effects';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [GroupListComponent],
  imports: [
    CommonModule,
    SharedModule,
    GroupRoutingModule,
    FormsModule,
    StoreModule.forFeature(groupsFeatureKey, reducer),
    EffectsModule.forFeature([GroupEffects])
  ]
  ,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GroupModule { }
