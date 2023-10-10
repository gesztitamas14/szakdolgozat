import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostAdRoutingModule } from './post-ad-routing.module';
import { PostAdComponent } from './post-ad.component';


@NgModule({
  declarations: [
    PostAdComponent
  ],
  imports: [
    CommonModule,
    PostAdRoutingModule
  ]
})
export class PostAdModule { }
