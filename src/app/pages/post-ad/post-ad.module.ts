import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PostAdRoutingModule } from './post-ad-routing.module';
import { PostAdComponent } from './post-ad.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PostAdComponent
  ],
  imports: [
    CommonModule,
    PostAdRoutingModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PostAdModule { }
