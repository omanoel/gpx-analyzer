import { Injectable } from '@angular/core';
import { GpxFile, TrackPoint, TrackData } from './gpx-file.model';

import * as proj4x from 'proj4';
const proj4 = (proj4x as any).default;
import { COLORS } from '../colors.constant';
import { RdpSimplify } from '../rdp-algorithm/rdb-simplify.service';
import { isDate } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class GpxFileService {
  constructor() {
    //
  }

  public buildGpxFile(
    file: any,
    jsonData: any,
    interpolationStep: number
  ): GpxFile {
    const original = this._buildOriginal(jsonData);
    const rdpSimplified = this._applyRdpAlgorithm(original);
    const originalCleaned = this._cleanOriginal(original);
    const interpolated = this._buildInterpolatedStatistics(
      originalCleaned,
      interpolationStep
    );
    return {
      title: file.name,
      data: jsonData,
      original: original,
      rdpSimplified: rdpSimplified,
      statistics: originalCleaned,
      interpolated: interpolated,
      date: file.lastModifiedDate
    };
  }

  private _buildOriginal(jsonData: any): TrackData {
    if (jsonData?.gpx?.trk == null) {
      return null;
    }
    const track = jsonData.gpx.trk;
    const stats: TrackData = this._initData(track.name);
    if (track.trkseg?.trkpt == null) {
      return stats;
    }
    const trkPt: any[] = track.trkseg.trkpt;
    stats.trkPoints = trkPt
      .map((s: any) => {
        const trackPoint = this._initTrackPoint();
        trackPoint.lon = +s['@_lon'];
        trackPoint.lat = +s['@_lat'];
        trackPoint.altitude = +s['ele'];
        trackPoint.datetime = new Date(s['time']).getTime();
        return trackPoint;
      })
      .filter(
        (trackP) =>
          !isNaN(trackP.lon) &&
          !isNaN(trackP.lat) &&
          !isNaN(trackP.altitude) &&
          !isDate(trackP.datetime)
      );
    this._computeData(stats, false);
    return stats;
  }

  private _cleanOriginal(original: TrackData): TrackData {
    const cleanedData: TrackData = Object.assign({}, original);
    let variance = 0;
    cleanedData.trkPoints.forEach(
      (p) =>
        (variance +=
          (p.speed - original.speedMove) * (p.speed - original.speedMove))
    );
    variance = Math.sqrt(variance / (original.trkPoints.length - 1));
    cleanedData.trkPoints = original.trkPoints.map((p, i) => {
      if (i > 0) {
        if (Math.abs(p.speed - original.trkPoints[i - 1].speed) > variance) {
          // clean speed + datetime by recompute
        }
      }
      return p;
    });
    return cleanedData;
  }

  private _buildStatistics(jsonData: any): TrackData {
    if (jsonData?.gpx?.trk == null) {
      return null;
    }
    const track = jsonData.gpx.trk;
    const stats: TrackData = this._initData(track.name);
    if (track.trkseg?.trkpt == null) {
      return stats;
    }
    const trkPt: any[] = track.trkseg.trkpt;
    stats.trkPoints = trkPt.map((s: any) => {
      const trackPoint = this._initTrackPoint();
      trackPoint.lon = +s['@_lon'];
      trackPoint.lat = +s['@_lat'];
      trackPoint.altitude = +s['ele'];
      trackPoint.datetime = new Date(s['time']).getTime();
      return trackPoint;
    });
    this._computeData(stats, false);
    return stats;
  }

  private _initData(title: string): TrackData {
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

  private _initTrackPoint(): TrackPoint {
    return {
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
  }

  private _computeData(stats: TrackData, interpolated: boolean): void {
    let length = 0;
    const lon0 = stats.trkPoints[0].lon;
    const lat0 = stats.trkPoints[0].lat;
    const z0 = stats.trkPoints[0].altitude;
    const datetime0 = stats.trkPoints[0].datetime;
    const xy0 = this._transformLonLatInEN(lon0, lat0);
    const xyzPrevious = [xy0[0], xy0[1], z0];
    let datetimePrevious = datetime0;
    let index = 0;
    stats.trkPoints.forEach((trackPoint: TrackPoint) => {
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
      if (!interpolated) {
        trackPoint.deltaDistance = Math.sqrt(
          deltaXDistance * deltaXDistance + deltaYDistance * deltaYDistance
        );
        trackPoint.speed = this._getDistanceInKm(
          this._getSpeedInKmPerHour(
            trackPoint.deltaDistance,
            trackPoint.deltaDatetime
          )
        );
      }
      length += trackPoint.deltaDistance;
      if (!interpolated) {
        trackPoint.deltaDistance0 = length;
      }
      xyzPrevious[0] = trackPoint.x;
      xyzPrevious[1] = trackPoint.y;
      xyzPrevious[2] = trackPoint.altitude;
      datetimePrevious = trackPoint.datetime;
      length = trackPoint.deltaDistance0;
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
    return 0;
  }

  private _setBoundaries(stats: TrackData, trackPoint: TrackPoint): void {
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
    statistics: TrackData,
    interpolationStep: number
  ): TrackData {
    const interpolatedStats = this._initData(statistics.title);
    let maxDistance = 0;
    interpolatedStats.trkPoints.push(statistics.trkPoints[0]);
    maxDistance += interpolationStep;
    for (let z = 1; z < statistics.trkPoints.length; z++) {
      while (statistics.trkPoints[z].deltaDistance0 > maxDistance) {
        interpolatedStats.trkPoints.push(
          this._buildInterpolatedTrackPoint(
            statistics.trkPoints[z - 1],
            statistics.trkPoints[z],
            maxDistance,
            interpolationStep
          )
        );
        maxDistance += interpolationStep;
      }
    }
    this._computeData(interpolatedStats, true);
    return interpolatedStats;
  }

  private _buildInterpolatedTrackPoint(
    previous: TrackPoint,
    next: TrackPoint,
    distance: number,
    stepDistance: number
  ): TrackPoint {
    let ratio = 0;
    if (next.deltaDistance0 !== previous.deltaDistance0) {
      ratio =
        (distance - previous.deltaDistance0) /
        (next.deltaDistance0 - previous.deltaDistance0);
    }
    const interpolatedPoint = this._initTrackPoint();
    interpolatedPoint.lon = this._interpolateValue(
      previous.lon,
      next.lon,
      ratio
    );
    interpolatedPoint.lat = this._interpolateValue(
      previous.lat,
      next.lat,
      ratio
    );
    interpolatedPoint.altitude = this._interpolateValue(
      previous.altitude,
      next.altitude,
      ratio
    );
    interpolatedPoint.speed = this._interpolateValue(
      previous.speed,
      next.speed,
      ratio
    );
    interpolatedPoint.datetime =
      previous.datetime + (stepDistance / interpolatedPoint.speed) * 1000;
    interpolatedPoint.deltaDistance0 = distance;
    interpolatedPoint.deltaDistance = stepDistance;
    return interpolatedPoint;
  }

  private _interpolateValue(
    previous: number,
    next: number,
    ratio: number
  ): number {
    if (previous === null || next === null) {
      return null;
    }
    if (next === previous) {
      return previous;
    }
    return previous + ratio * (next - previous);
  }

  private _applyRdpAlgorithm(original: TrackData): TrackData {
    const lines = original.trkPoints.map((trackPoint: TrackPoint) => [
      trackPoint.x,
      trackPoint.y
    ]);
    let simplifiedLines = RdpSimplify.applyAlgorithm(lines, 1);
    const simplifiedData: TrackData = Object.assign({}, original);
    simplifiedData.trkPoints = simplifiedData.trkPoints.filter(
      (trackPoint: TrackPoint) => {
        let findIdx = -1;
        const find = simplifiedLines.find((sLine, idx) => {
          findIdx = idx;
          return sLine[0] === trackPoint.x && sLine[1] === trackPoint.y;
        });
        if (findIdx !== -1) {
          simplifiedLines = simplifiedLines.filter(
            (value, idx) => idx !== findIdx
          );
        }
        return findIdx !== -1;
      }
    );
    return simplifiedData;
  }
}
