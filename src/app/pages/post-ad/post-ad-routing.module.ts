import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostAdComponent } from './post-ad.component';

const routes: Routes = [
  { path: '', component: PostAdComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PostAdRoutingModule { }
