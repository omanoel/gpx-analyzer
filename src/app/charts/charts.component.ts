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

  public axisForm: FormGroup;
  public xAxisFc: FormControl;
  public yAxisFc: FormControl;
  public chartTypeFc: FormControl;

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

  constructor() {
    //
  }

  ngOnInit(): void {
    this.axisOptions = Object.keys(this.item.interpolated.trkPoints[0]);
    this.chartTypeOptions = ['line', 'scatter'];
    this._initForm();
    this._initChart('deltaDistance0', 'speed', 'line');
  }

  close(): void {
    this.onClose.emit();
  }

  private _initForm(): void {
    this.axisForm = new FormGroup({});
    this.xAxisFc = new FormControl('deltaDistance0', [Validators.required]);
    this.yAxisFc = new FormControl('speed', [Validators.required]);
    this.chartTypeFc = new FormControl('line', [Validators.required]);
    this.axisForm.addControl('xAxisFc', this.xAxisFc);
    this.axisForm.addControl('yAxisFc', this.yAxisFc);
    this.axisForm.addControl('chartTypeFc', this.chartTypeFc);
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
    this.item.interpolated.trkPoints.sort(
      (a, b) => a.deltaDistance0 - b.deltaDistance0
    );
    const interpolatedData: number[][] = this.item.interpolated.trkPoints.map(
      (trkP) => {
        const x = (trkP[xProperty] as number).toFixed(2);
        const y = (trkP[yProperty] as number).toFixed(2);
        return [parseFloat(x), parseFloat(y)];
      }
    );
    // Original data
    this.item.statistics.trkPoints.sort(
      (a, b) => a.deltaDistance0 - b.deltaDistance0
    );
    const originalData: number[][] = this.item.statistics.trkPoints.map(
      (trkP) => {
        const x = (trkP[xProperty] as number).toFixed(2);
        const y = (trkP[yProperty] as number).toFixed(2);
        return [parseFloat(x), parseFloat(y)];
      }
    );

    this.options = {
      color: ['#5470C6', '#EE6666'],
      tooltip: {
        trigger: 'item',
        formatter: '{a}: [{c}]'
      },
      legend: {
        data: ['original', 'interpolated']
      },
      dataZoom: [
        {
          type: 'slider',
          filterMode: 'none',
          xAxisIndex: 0
        },
        {
          type: 'inside',
          filterMode: 'none',
          xAxisIndex: 0
        },
        {
          type: 'slider',
          filterMode: 'none',
          yAxisIndex: 0
        },
        {
          type: 'inside',
          filterMode: 'none',
          yAxisIndex: 0
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
          data: originalData,
          smooth: true
        },
        {
          name: 'interpolated',
          type: chartType,
          data: interpolatedData,
          smooth: true
        }
      ]
    };
  }
}
