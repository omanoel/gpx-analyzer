import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { GpxFileDbService } from '../dexie-db/gpx-file-db.service';
import { GpxFile } from '../dexie-db/gpx-file.model';
import { MainComponentModel } from '../main.component.model';
import { SceneService } from '../scene/scene.service';

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
  //
  constructor(
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
      const tk3d = this._sceneService
        .getTack3ds(this.model.scene)
        .find((obj) => obj.name === found.statistics.title);
      if (tk3d) {
        tk3d.visible = !tk3d.visible;
        this.model.needsUpdate = true;
        this._changeDetectorRef.detectChanges();
      }
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

  reduce(): void {
    console.log('reduce');
  }
  move(): void {
    console.log('move');
  }

  refresh(): void {
    this.getAll();
  }

  getRgbColor(gpxFile: GpxFile): string {
    const colors: number[] = gpxFile.statistics.colors;
    const r = colors[0];
    const g = colors[1];
    const b = colors[2];
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
}
