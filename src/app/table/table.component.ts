import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MainComponentModel } from '../@main/main.component.model';
import { GpxFile, TrackPoint } from '../@shared/gpx-file/gpx-file.model';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent implements OnInit {
  @Input()
  public model: MainComponentModel;
  @Input()
  public item: GpxFile;
  @Output()
  public onClose: EventEmitter<void> = new EventEmitter();

  public tableOriginalData: number[][] = [];
  public tableInterpolatedData: number[][] = [];

  public axisOptions: string[];
  public axisForm: FormGroup;
  public xAxisFc: FormControl;
  public yAxisFc: FormControl;

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

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    // Empty
  }

  ngOnInit(): void {
    //
    this.axisOptions = Object.keys(this.item.interpolated.trkPoints[0]);
    this._initForm();
    this._initTable(this.xAxisFc.value, this.yAxisFc.value);
  }

  close(): void {
    this.onClose.emit();
  }

  private _initForm(): void {
    this.axisForm = new FormGroup({});
    this.xAxisFc = new FormControl('deltaDistance0', [Validators.required]);
    this.yAxisFc = new FormControl('speed', [Validators.required]);
    this.axisForm.addControl('xAxis', this.xAxisFc);
    this.axisForm.addControl('yAxis', this.yAxisFc);
    this.axisForm.valueChanges.subscribe(() => {
      // init table
      this._initTable(this.xAxisFc.value, this.yAxisFc.value);
    });
  }

  private _initTable(
    xProperty: keyof TrackPoint,
    yProperty: keyof TrackPoint
  ): void {
    // Interpolated data
    this.item.interpolated.trkPoints.sort(
      (a, b) => a.deltaDistance0 - b.deltaDistance0
    );
    const interpolatedData: number[][] = this.item.interpolated.trkPoints.map(
      (trkP) => [trkP[xProperty] as number, trkP[yProperty] as number]
    );
    // Original data
    this.item.statistics.trkPoints.sort(
      (a, b) => a.deltaDistance0 - b.deltaDistance0
    );
    const originalData: number[][] = this.item.statistics.trkPoints.map(
      (trkP) => [trkP[xProperty] as number, trkP[yProperty] as number]
    );

    this.tableOriginalData = originalData;
    this.tableInterpolatedData = interpolatedData;
    this._changeDetectorRef.detectChanges();
  }
}
