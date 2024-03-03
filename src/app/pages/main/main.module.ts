import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { MatOptionModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { CeilPipe } from '../../shared/pipes/ceil.pipe';



@NgModule({
    declarations: [
        MainComponent,
        CeilPipe
    ],
    imports: [
        CommonModule,
        MainRoutingModule,
        MatIconModule,
        FormsModule,
        MatRadioModule,
        MatOptionModule,
        MatAutocompleteModule,
    ]
})
export class MainModule { }
