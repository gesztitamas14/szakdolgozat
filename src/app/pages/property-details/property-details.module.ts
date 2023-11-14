import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PropertyDetailsRoutingModule } from './property-details-routing.module';
import { PropertyDetailsComponent } from './property-details.component';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [
    PropertyDetailsComponent
  ],
  imports: [
    CommonModule,
    PropertyDetailsRoutingModule,
    MatIconModule
  ]
})
export class PropertyDetailsModule { }
