import { Injectable } from '@angular/core';
import { GpxFile, TrackPoint, TrackStatistics } from './gpx-file.model';

import * as proj4x from 'proj4';
import { COLORS } from '../colors.constant';
const proj4 = (proj4x as any).default;

@Injectable({
  providedIn: 'root'
})
export class GpxFileService {
  constructor() {
    //
  }

  public buildGpxFile(file: any, jsonData: any): GpxFile {
    const statistics = this._buildStatistics(jsonData);
    const interpolated = this._buildInterpolatedStatistics(statistics);
    return {
      title: file.name,
      data: jsonData,
      statistics: statistics,
      interpolated: interpolated,
      date: file.lastModifiedDate
    };
  }

  private _buildStatistics(jsonData: any): TrackStatistics {
    if (jsonData?.gpx?.trk == null) {
      return null;
    }
    const track = jsonData.gpx.trk;
    const stats: TrackStatistics = this._initStatistics(track.name);
    if (track.trkseg?.trkpt == null) {
      return stats;
    }
    let length = 0;
    const trkPt: any[] = track.trkseg.trkpt;
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
      trackPoint.speed = this._getDistanceInKm(
        this._getSpeedInKmPerHour(
          trackPoint.deltaDistance,
          trackPoint.deltaDatetime
        )
      );
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
      stats.speedMax =
        stats.speedMax < trackPoint.speed ? trackPoint.speed : stats.speedMax;
    });
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

  private _initStatistics(title: string): TrackStatistics {
    return {
      title: title,
      distance: 0,
      delayMove: 0,
      delayTotal: 0,
      speedMove: 0,
      speedTotal: 0,
      speedMax: Number.NEGATIVE_INFINITY,
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

  private _buildInterpolatedStatistics(
    statistics: TrackStatistics
  ): TrackStatistics {
    const interpolated = this._initStatistics(statistics.title);
    /*
    const trackPts: TrackPoint[] = [].concat(...statistics.trkPoints);
    let maxDistance = 0;
    let indexPrevious = 0;
    let indexNext = 0;
    interpolated.trkPoints.push(trackPts[indexPrevious]);
    while (maxDistance < statistics.distance) {
      maxDistance += 0.02;
      for (let z = indexPrevious + 1; z < trackPts.length; z++) {
        if (trackPts[z].deltaDistance0 <= maxDistance) {
        }
      }
      maxDistance += 0.02;
    }
    */
    return interpolated;
  }
}
