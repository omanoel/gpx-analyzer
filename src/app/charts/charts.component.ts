import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EChartsOption, graphic } from 'echarts';
import { MainComponentModel } from '../@main/main.component.model';
import { GpxFile, TrackPoint } from '../@shared/gpx-file/gpx-file.model';

export type ChartType = 'line' | 'scatter';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  public options: EChartsOption;
  public axisOptions: string[];
  public chartTypeOptions: string[];
  @Input()
  public model: MainComponentModel;
  @Input()
  public item: GpxFile;
  @Output()
  public onClose: EventEmitter<void> = new EventEmitter();

  public top = 100;
  public left = 100;

  public axisForm: FormGroup;
  public xAxisFc: FormControl;
  public yAxisFc: FormControl;
  public chartTypeFc: FormControl;

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

  constructor() {
    //
  }

  ngOnInit(): void {
    this.axisOptions = Object.keys(this.item.interpolated.trkPoints[0]);
    this.chartTypeOptions = ['line', 'scatter'];
    this._initForm();
    this._initChart('deltaDistance0', 'speed', 'line');
  }

  private _initForm(): void {
    this.axisForm = new FormGroup({});
    this.xAxisFc = new FormControl('deltaDistance0', [Validators.required]);
    this.yAxisFc = new FormControl('speed', [Validators.required]);
    this.chartTypeFc = new FormControl('line', [Validators.required]);
    this.axisForm.addControl('xAxis', this.xAxisFc);
    this.axisForm.addControl('yAxis', this.yAxisFc);
    this.axisForm.addControl('chartType', this.chartTypeFc);
    this.axisForm.valueChanges.subscribe(() => {
      // init chart
      this._initChart(
        this.xAxisFc.value,
        this.yAxisFc.value,
        this.chartTypeFc.value
      );
    });
  }

  private _initChart(
    xProperty: keyof TrackPoint,
    yProperty: keyof TrackPoint,
    chartType: ChartType
  ): void {
    // Interpolated data
    const interpolatedData: number[][] = this.item.interpolated.trkPoints.map(
      (trkP) => [trkP[xProperty] as number, trkP[yProperty] as number]
    );
    interpolatedData.sort((a, b) => a[0] - b[0]);
    // Original data
    const originalData: number[][] = this.item.statistics.trkPoints.map(
      (trkP) => [trkP[xProperty] as number, trkP[yProperty] as number]
    );
    originalData.sort((a, b) => a[0] - b[0]);

    this.options = {
      color: ['#5470C6', '#EE6666'],
      tooltip: {
        trigger: 'item'
      },
      legend: {
        data: ['original', 'interpolated']
      },
      dataZoom: [
        {
          show: true,
          filterMode: 'none'
        },
        {
          type: 'inside',
          filterMode: 'none'
        }
      ],
      grid: {
        top: 70,
        bottom: 50
      },
      xAxis: [
        {
          type: 'value',
          min: 'dataMin',
          max: 'dataMax'
        }
      ],
      yAxis: [
        {
          type: 'value',
          min: 'dataMin',
          max: 'dataMax'
        }
      ],
      areaStyle: {},
      series: [
        {
          name: 'original',
          type: chartType,
          data: originalData
        },
        {
          name: 'interpolated',
          type: chartType,
          data: interpolatedData
        }
      ]
    };
  }

  close(): void {
    this.onClose.emit();
  }
}
