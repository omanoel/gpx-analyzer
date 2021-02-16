import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EChartsOption } from 'echarts';
import { MainComponentModel } from '../@main/main.component.model';
import { GpxFile } from '../@shared/gpx-file/gpx-file.model';

@Component({
  selector: 'app-charts',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss']
})
export class ChartsComponent implements OnInit {
  options: EChartsOption;
  @Input()
  public model: MainComponentModel;
  @Input()
  public item: GpxFile;
  @Output()
  public onClose: EventEmitter<void> = new EventEmitter();

  constructor() {
    //
  }

  ngOnInit(): void {
    const interpolatedData: number[][] = this.item.interpolated.trkPoints.map(
      (trkP) => [trkP.deltaDistance0, trkP.speed]
    );
    interpolatedData.sort((a, b) => a[0] - b[0]);
    const originalData: number[][] = this.item.statistics.trkPoints.map(
      (trkP) => [trkP.deltaDistance0, trkP.speed]
    );
    originalData.sort((a, b) => a[0] - b[0]);

    this.options = {
      color: ['#5470C6', '#EE6666'],
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['original', 'interpolated']
      },
      dataZoom: [
        {
          show: true,
          start: 0,
          end: 100,
          filterMode: 'none'
        },
        {
          type: 'inside',
          start: 0,
          end: 100,
          filterMode: 'none'
        }
      ],
      grid: {
        top: 70,
        bottom: 50
      },
      xAxis: [
        {
          type: 'value'
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'original',
          type: 'line',
          data: originalData
        },
        {
          name: 'interpolated',
          type: 'line',
          data: interpolatedData
        }
      ]
    };
  }

  close(): void {
    this.onClose.emit();
  }
}
