import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IndicatorsComponent } from './indicators/indicators.component';

import { MainComponent } from './main.component';
import { MapComponent } from './map/map.component';
import { ToolsComponent } from './tools/tools.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  declarations: [
    MainComponent,
    MapComponent,
    IndicatorsComponent,
    ToolsComponent
  ],
  exports: [MainComponent]
})
export class MainModule {}
