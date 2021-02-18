import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  Output,
  EventEmitter,
  HostListener
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { GpxFile } from '../../@shared/gpx-file/gpx-file.model';

@Component({
  selector: 'app-gpx-statistics',
  templateUrl: './gpx-statistics.component.html',
  styleUrls: ['./gpx-statistics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GpxStatisticsComponent implements OnInit {
  @Input()
  public item: GpxFile;

  @Output()
  public onClose: EventEmitter<void> = new EventEmitter();

  public top = 100;
  public left = 100;

  private _clientX = 0;
  private _clientY = 0;

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    this._clientX = event.clientX;
    this._clientY = event.clientY;
  }

  @HostListener('dragend', ['$event'])
  onDragEnd(event: DragEvent): void {
    event.preventDefault();
    this.left += event.clientX - this._clientX;
    this.top += event.clientY - this._clientY;
  }

  constructor(public translate: TranslateService) {
    // Empty
  }

  ngOnInit(): void {
    //
  }

  close(): void {
    this.onClose.emit();
  }

  formatDelay(value: number): string {
    const hours = value / 1000 / 60 / 60;
    const partHours = Math.floor(hours);
    const mins = (hours - partHours) * 60;
    const partMins = Math.floor(mins);
    const secs = (mins - partMins) * 60;
    const partSecs = Math.floor(secs);

    return partHours + ':' + partMins + ':' + partSecs;
  }

  getRgbColor(gpxFile: GpxFile): string {
    const colors: number[] = gpxFile.statistics.colors;
    const r = colors[0];
    const g = colors[1];
    const b = colors[2];
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }
}
