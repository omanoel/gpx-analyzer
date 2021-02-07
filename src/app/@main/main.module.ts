import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DndDirective } from '../gpx-manager/files-uploader/dnd.diective';
import { FilesUploaderComponent } from '../gpx-manager/files-uploader/files-uploader.component';
import { GpxManagerComponent } from '../gpx-manager/gpx-manager.component';
import { GpxStatisticsComponent } from '../gpx-manager/gpx-statistics/gpx-statistics.component';
import { ProgressComponent } from '../gpx-manager/progress/progress.component';
import { IndicatorsComponent } from '../indicators/indicators.component';
import { MainComponent } from './main.component';
import { MapComponent } from '../map/map.component';
import { MenuComponent } from '../menu/menu.component';
import { ToolsComponent } from '../tools/tools.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  declarations: [
    DndDirective,
    MainComponent,
    MapComponent,
    IndicatorsComponent,
    ToolsComponent,
    GpxManagerComponent,
    GpxStatisticsComponent,
    FilesUploaderComponent,
    ProgressComponent,
    MenuComponent
  ],
  exports: [MainComponent]
})
export class MainModule {}
