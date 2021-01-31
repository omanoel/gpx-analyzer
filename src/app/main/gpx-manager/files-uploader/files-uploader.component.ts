import {
  Component,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { GpxFileDbService } from '../../dexie-db/gpx-file-db.service';
import * as XmlParser from 'fast-xml-parser';
import * as proj4x from 'proj4';
import { TrackPoint, TrackStatistics } from '../../track/track.model';
import { COLORS } from '../../colors.constant';
const proj4 = (proj4x as any).default;

@Component({
  selector: 'app-files-uploader',
  templateUrl: './files-uploader.component.html',
  styleUrls: ['./files-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesUploaderComponent {
  @Output() onAdd: EventEmitter<void> = new EventEmitter();
  @ViewChild('fileDropRef', { static: false }) fileDropEl: ElementRef;
  files: any[] = [];

  constructor(
    private _gpxFileDbService: GpxFileDbService,
    private _changeDetectorRef: ChangeDetectorRef
  ) {}

  /**
   * on file drop handler
   */
  onFileDropped($event: any): void {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler($event: any): void {
    const element = $event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    const files: any[] = [];
    if (fileList) {
      for (let i = 0; i < fileList.length; i++) {
        files.push(fileList.item(i));
      }
      this.prepareFilesList(files);
    }
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number): void {
    if (this.files[index].progress < 100) {
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number): void {
    const reader = new FileReader();
    reader.readAsText(this.files[index]);

    reader.onprogress = (event: ProgressEvent<FileReader>) => {
      this.files[index].progress = (event.loaded / event.total) * 100;
      this._changeDetectorRef.detectChanges();
    };

    reader.onloadend = () => {
      const xmlToJson = this._transformXmlToJson(reader.result);
      this._gpxFileDbService
        .add({
          title: this.files[index].name,
          data: xmlToJson,
          statistics: this._buildStatistiques(xmlToJson),
          date: this.files[index].lastModifiedDate
        })
        .then((id) => {
          index++;
          if (index < this.files.length) {
            this.uploadFilesSimulator(index);
          } else {
            this.onAdd.emit();
          }
        });
    };
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>): void {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
    this.fileDropEl.nativeElement.value = '';
    this.uploadFilesSimulator(0);
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  private _transformXmlToJson(data: any): any {
    const defaultOptions: XmlParser.J2xOptions = {
      attributeNamePrefix: '@_',
      attrNodeName: '@', //default is false
      textNodeName: '#text',
      ignoreAttributes: false,
      cdataTagName: '__cdata', //default is false
      cdataPositionChar: '\\c',
      format: false,
      indentBy: '  ',
      supressEmptyNode: false,
      tagValueProcessor: (a: string) => a, // default is a=>a
      attrValueProcessor: (a) => a
    };
    return XmlParser.parse(<string>data, defaultOptions);
  }

  private _buildStatistiques(jsonData: any): TrackStatistics {
    const stats: TrackStatistics = {
      title: jsonData?.gpx?.trk?.name,
      distance: 0,
      delayMove: 0,
      delayTotal: 0,
      speedMove: 0,
      speedTotal: 0,
      speedMax: 0,
      altitudeMin: Number.POSITIVE_INFINITY,
      altitudeMax: Number.NEGATIVE_INFINITY,
      ascendingElevation: 0,
      descendingElevation: 0,
      lonMin: Number.POSITIVE_INFINITY,
      lonMax: Number.NEGATIVE_INFINITY,
      latMin: Number.POSITIVE_INFINITY,
      latMax: Number.NEGATIVE_INFINITY,
      xMin: Number.POSITIVE_INFINITY,
      xMax: Number.NEGATIVE_INFINITY,
      yMin: Number.POSITIVE_INFINITY,
      yMax: Number.NEGATIVE_INFINITY,
      points: 0,
      trkPoints: [],
      colors: []
    };
    let length = 0;
    const trkPt: any[] = jsonData?.gpx?.trk?.trkseg?.trkpt;
    if (trkPt) {
      const lon0 = +trkPt[0]['@']['@_lon'];
      const lat0 = +trkPt[0]['@']['@_lat'];
      const z0 = +trkPt[0]['ele'];
      const datetime0 = new Date(trkPt[0]['time']).getTime();
      const xy0 = this._transformLonLatInEN(lon0, lat0);
      const xyzPrevious = [xy0[0], xy0[1], z0];
      let datetimePrevious = datetime0;
      let index = 0;
      trkPt.forEach((s: any) => {
        const trackPoint: TrackPoint = {
          lon: null,
          lat: null,
          altitude: null,
          x: null,
          y: null,
          datetime: null,
          speed: null,
          deltaX: null,
          deltaY: null,
          deltaZ: null,
          deltaDistance: null,
          deltaDatetime: null,
          deltaX0: null,
          deltaY0: null,
          deltaZ0: null,
          deltaDistance0: null,
          deltaDatetime0: null,
          temperature: null,
          windSpeed: null,
          windDirection: null
        };
        trackPoint.lon = +s['@']['@_lon'];
        trackPoint.lat = +s['@']['@_lat'];
        trackPoint.altitude = +s['ele'];
        trackPoint.datetime = new Date(s['time']).getTime();
        trackPoint.deltaDatetime0 = trackPoint.datetime - datetime0;
        trackPoint.deltaDatetime = trackPoint.datetime - datetimePrevious;
        const xy = this._transformLonLatInEN(trackPoint.lon, trackPoint.lat);
        trackPoint.x = xy[0];
        trackPoint.y = xy[1];
        trackPoint.deltaX0 = trackPoint.x - xy0[0];
        trackPoint.deltaY0 = trackPoint.y - xy0[1];
        trackPoint.deltaZ0 = trackPoint.altitude - z0;
        trackPoint.deltaX = trackPoint.x - xyzPrevious[0];
        trackPoint.deltaY = trackPoint.y - xyzPrevious[1];
        trackPoint.deltaZ = trackPoint.altitude - xyzPrevious[2];
        const deltaXDistance = trackPoint.x - xyzPrevious[0];
        const deltaYDistance = trackPoint.y - xyzPrevious[1];
        trackPoint.deltaDistance = Math.sqrt(
          deltaXDistance * deltaXDistance + deltaYDistance * deltaYDistance
        );
        trackPoint.speed =
          trackPoint.deltaDatetime > 0
            ? (trackPoint.deltaDistance / trackPoint.deltaDatetime) * 1000
            : 0;
        length += trackPoint.deltaDistance;
        trackPoint.deltaDistance0 = length;
        xyzPrevious[0] = trackPoint.x;
        xyzPrevious[1] = trackPoint.y;
        xyzPrevious[2] = trackPoint.altitude;
        datetimePrevious = trackPoint.datetime;
        length = trackPoint.deltaDistance0;
        stats.trkPoints.push(trackPoint);
        this._setBoundaries(stats, trackPoint);
        stats.colors = COLORS.get(index);
        index++;
        if (index === COLORS.size) {
          index = 0;
        }
      });
    }
    stats.distance = this._getDistanceInKm(
      stats.trkPoints[stats.trkPoints.length - 1].deltaDistance0
    );
    stats.delayTotal =
      stats.trkPoints[stats.trkPoints.length - 1].deltaDatetime0;
    stats.delayMove = this._buildDelayMove(stats.trkPoints);
    stats.speedMove = this._getSpeedInKmPerHour(
      stats.distance,
      stats.delayMove
    );
    stats.speedTotal = this._getSpeedInKmPerHour(
      stats.distance,
      stats.delayTotal
    );
    stats.descendingElevation =
      Math.round(stats.descendingElevation * 100) / 100;
    stats.ascendingElevation = Math.round(stats.ascendingElevation * 100) / 100;
    stats.points = stats.trkPoints.length;

    return stats;
  }

  private _transformLonLatInEN(lon: number, lat: number): number[] {
    this._defLambert93();
    return proj4('EPSG:2154').forward([lon, lat]);
    // .map((item: number) => Math.round(item * 100) / 100);
  }

  private _buildDelayMove(trackPoints: TrackPoint[]): number {
    let delay = 0;
    trackPoints
      .filter((p) => p.speed > 0.2)
      .forEach((p) => (delay += p.deltaDatetime));
    return delay;
  }

  private _defLambert93(): void {
    proj4.defs(
      'EPSG:2154',
      '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
    );
  }

  private _getDistanceInKm(value: number): number {
    return Math.floor(value / 10) / 100;
  }

  private _getSpeedInKmPerHour(distance: number, time: number): number {
    if (distance > 0) {
      return Math.floor(((distance * 3600000) / time) * 100) / 100;
    }
    return NaN;
  }

  private _setBoundaries(stats: TrackStatistics, trackPoint: TrackPoint): void {
    stats.latMin =
      trackPoint.lat < stats.latMin ? trackPoint.lat : stats.latMin;
    stats.latMax =
      trackPoint.lat > stats.latMax ? trackPoint.lat : stats.latMax;
    stats.lonMin =
      trackPoint.lon < stats.lonMin ? trackPoint.lon : stats.lonMin;
    stats.lonMax =
      trackPoint.lon > stats.lonMax ? trackPoint.lon : stats.lonMax;
    stats.xMin = trackPoint.x < stats.xMin ? trackPoint.x : stats.xMin;
    stats.xMax = trackPoint.x > stats.xMax ? trackPoint.x : stats.xMax;
    stats.yMin = trackPoint.y < stats.yMin ? trackPoint.y : stats.yMin;
    stats.yMax = trackPoint.y > stats.yMax ? trackPoint.y : stats.yMax;
    stats.altitudeMax =
      trackPoint.altitude > stats.altitudeMax
        ? trackPoint.altitude
        : stats.altitudeMax;
    stats.altitudeMin =
      trackPoint.altitude < stats.altitudeMin
        ? trackPoint.altitude
        : stats.altitudeMin;
    if (trackPoint.deltaZ < 0) {
      stats.descendingElevation += Math.abs(trackPoint.deltaZ);
    } else {
      stats.ascendingElevation += Math.abs(trackPoint.deltaZ);
    }
  }
}
