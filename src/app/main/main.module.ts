import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { MainComponent } from './main.component';
import { MapComponent } from './map/map.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  declarations: [MainComponent, MapComponent],
  exports: [MainComponent]
})
export class MainModule {}
