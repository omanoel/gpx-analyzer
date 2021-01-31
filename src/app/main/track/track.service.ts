import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { MainComponentModel } from '../main.component.model';

import * as proj4x from 'proj4';
import { TrackPoint } from './track.model';
const proj4 = (proj4x as any).default;

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  constructor() {
    // Empty
  }

  public build3dTracks(mainComponentModel: MainComponentModel): void {
    mainComponentModel.tracks.forEach((t) => {
      t.children.length = 0;
      t.add(this._build3dTrack(t, mainComponentModel.zScale));
      mainComponentModel.scene.add(t);
    });
  }

  private _build3dTrack(track: THREE.Object3D, zScale: number): THREE.Object3D {
    const track3dChildren = new THREE.Object3D();
    const color = 0xffffff;
    const materialTrackSeg = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.8
    });
    const meshes: THREE.Mesh[] = [];
    const points: THREE.Vector3[] = [];
    const trackPoints: TrackPoint[] = [];
    let length = 0;
    let c = 0;
    const jsonData = track.userData['gpx'];
    if (jsonData?.gpx?.trk?.trkseg?.trkpt) {
      const lon0 = +jsonData.gpx.trk.trkseg.trkpt[0]['@']['@_lon'];
      const lat0 = +jsonData.gpx.trk.trkseg.trkpt[0]['@']['@_lat'];
      const z0 = +jsonData.gpx.trk.trkseg.trkpt[0]['ele'];
      const datetime0 = new Date(
        jsonData.gpx.trk.trkseg.trkpt[0]['time']
      ).getTime();
      const xy0 = this._transformLonLatInEN(lon0, lat0);
      const xyzPrevious = [xy0[0], xy0[1], z0];
      let datetimePrevious = datetime0;
      let r = 1;
      let g = 1;
      let b = 1;

      jsonData.gpx.trk.trkseg.trkpt.forEach((s: any) => {
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
        points.push(
          new THREE.Vector3(
            trackPoint.deltaX0,
            trackPoint.deltaY0,
            trackPoint.deltaZ0 * zScale
          )
        );
        if (Math.floor(length / 1000) !== c) {
          r = 1;
          g = r === 1 ? 0 : 1;
          b = r === 1 ? 0 : 1;
          c = Math.floor(length / 1000);
        }
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        geometry.translate(
          trackPoint.deltaX0,
          trackPoint.deltaY0,
          trackPoint.deltaZ0 * zScale
        );
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(r, g, b)
        });
        meshes.push(new THREE.Mesh(geometry, material));
        xyzPrevious[0] = trackPoint.x;
        xyzPrevious[1] = trackPoint.y;
        xyzPrevious[2] = trackPoint.altitude;
        datetimePrevious = trackPoint.datetime;
        length = trackPoint.deltaDistance0;
        trackPoints.push(trackPoint);
      });
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    track3dChildren.add(new THREE.Line(geometry, materialTrackSeg));
    track3dChildren.add(...meshes);
    track.userData['stats'] = {
      distance: trackPoints[trackPoints.length - 1].deltaDistance0,
      delayTotal: trackPoints[trackPoints.length - 1].deltaDatetime0,
      delayMove: this._buildDelayMove(trackPoints),
      points: trackPoints.length,
      trkPoints: trackPoints
    };
    return track3dChildren;
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
}
