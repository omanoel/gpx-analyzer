import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GpxFileDbService } from '../@shared/gpx-file/gpx-file-db.service';
import { GpxFile } from '../@shared/gpx-file/gpx-file.model';
import { MainComponentModel } from '../@main/main.component.model';
import { SceneService } from '../@shared/scene/scene.service';

@Component({
  selector: 'app-gpx-manager',
  templateUrl: './gpx-manager.component.html',
  styleUrls: ['./gpx-manager.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpxManagerComponent implements OnInit {
  @Input()
  public model: MainComponentModel;
  public displayAdd = false;
  public selectedItem: GpxFile = null;
  public selectedItemForChart: GpxFile = null;
  public displayCharts = false;
  //
  constructor(
    public translate: TranslateService,
    private _gpxFileDbService: GpxFileDbService,
    private _sceneService: SceneService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.getAll();
  }

  getAll(): void {
    this._gpxFileDbService.getAll().then((gpxFiles: GpxFile[]) => {
      this.model.gpxFiles = gpxFiles;
      this.displayAdd = false;
      this.model.needsUpdate = true;
      this._changeDetectorRef.detectChanges();
    });
  }

  refresh(): void {
    this.getAll();
  }

  delete(id: number): void {
    //if (confirm('Are you sure ?')) {
    this._gpxFileDbService.remove(id).then(() => {
      this.model.gpxFiles = this.model.gpxFiles.filter(
        (gpxFile) => gpxFile.id !== id
      );
      this.model.needsUpdate = true;
      this._changeDetectorRef.detectChanges();
    });
    //}
  }

  see(id: number): void {
    const found = this.model.gpxFiles.find((gpxFile) => gpxFile.id === id);
    if (found) {
      const tk3ds = this._sceneService
        .getTack3ds(this.model.scene)
        .filter((obj) => obj.name === found.statistics.title);
      tk3ds.forEach((tk3d) => {
        tk3d.visible = !tk3d.visible;
      });

      this.model.needsUpdate = true;
      this._changeDetectorRef.detectChanges();
    }
  }

  isVisible(id: number): boolean {
    const found = this.model.gpxFiles.find((gpxFile) => gpxFile.id === id);
    if (found) {
      const tk3d = this._sceneService
        .getTack3ds(this.model.scene)
        .find((obj) => obj.name === found.statistics.title);
      if (tk3d) {
        return tk3d.visible;
      }
    }
    return false;
  }

  getRgbColor(gpxFile: GpxFile): string {
    const colors: number[] = gpxFile.statistics.colors;
    const r = colors[0];
    const g = colors[1];
    const b = colors[2];
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  showStats(id: number): void {
    this.selectedItem = this.model.gpxFiles.find(
      (gpxFile) => gpxFile.id === id
    );
  }

  closeStats(): void {
    this.selectedItem = null;
    this._changeDetectorRef.detectChanges();
  }

  showCharts(id: number): void {
    this.selectedItemForChart = this.model.gpxFiles.find(
      (gpxFile) => gpxFile.id === id
    );
    this.displayCharts = true;
    this._changeDetectorRef.detectChanges();
  }

  closeCharts(): void {
    this.displayCharts = false;
    this.selectedItemForChart = null;
    this._changeDetectorRef.detectChanges();
  }
}
