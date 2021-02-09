import { Injectable } from '@angular/core';
import * as THREE from 'three';
import { MainComponentModel } from '../../@main/main.component.model';
import { TrackPoint, TrackStatistics } from '../gpx-file/gpx-file.model';
import { SceneService } from '../scene/scene.service';

@Injectable({
  providedIn: 'root'
})
export class Track3dService {
  constructor(private _sceneService: SceneService) {
    // Empty
  }

  public build3dTracks(mainComponentModel: MainComponentModel): void {
    if (
      mainComponentModel.firstPosition === null ||
      (mainComponentModel.firstPosition.x === 0 &&
        mainComponentModel.firstPosition.y === 0 &&
        mainComponentModel.firstPosition.z === 0)
    ) {
      mainComponentModel.firstPosition = new THREE.Vector3(0, 0, 0);
      if (mainComponentModel.gpxFiles.length > 0) {
        mainComponentModel.firstPosition.setX(
          mainComponentModel.gpxFiles[0].statistics.trkPoints[0].x
        );
        mainComponentModel.firstPosition.setY(
          mainComponentModel.gpxFiles[0].statistics.trkPoints[0].y
        );
        mainComponentModel.firstPosition.setZ(
          mainComponentModel.gpxFiles[0].statistics.trkPoints[0].altitude
        );
      }
    }

    this._remove3dTracks(mainComponentModel);
    this._add3dTracks(mainComponentModel, mainComponentModel.firstPosition);
  }

  public removeAll(mainComponentModel: MainComponentModel): void {
    mainComponentModel.scene.remove(
      ...this._sceneService.getTack3ds(mainComponentModel.scene)
    );
  }

  private _add3dTracks(
    mainComponentModel: MainComponentModel,
    origin: THREE.Vector3
  ): void {
    const obj3dsToAdd: THREE.Object3D[] = [];
    mainComponentModel.gpxFiles.forEach((gpxFile) => {
      if (
        !this._sceneService
          .getTack3ds(mainComponentModel.scene)
          .find((obj3d) => gpxFile.statistics.title === obj3d.name)
      ) {
        obj3dsToAdd.push(
          this._build3dTrack(
            gpxFile.statistics,
            mainComponentModel.zScale,
            origin,
            false
          )
        );
        obj3dsToAdd.push(
          this._build3dTrack(
            gpxFile.interpolated,
            mainComponentModel.zScale,
            origin,
            true
          )
        );
      }
    });
    if (obj3dsToAdd.length > 0) {
      mainComponentModel.scene.add(...obj3dsToAdd);
    }
  }

  private _remove3dTracks(mainComponentModel: MainComponentModel): void {
    const obj3dsToRemove: THREE.Object3D[] = [];
    this._sceneService.getTack3ds(mainComponentModel.scene).forEach((obj3d) => {
      if (
        !mainComponentModel.gpxFiles.find(
          (gpxFile) => gpxFile.statistics.title === obj3d.name
        )
      ) {
        obj3dsToRemove.push(obj3d);
      }
    });
    if (obj3dsToRemove.length > 0) {
      mainComponentModel.scene.remove(...obj3dsToRemove);
    }
  }

  private _build3dTrack(
    gpxStatistics: TrackStatistics,
    zScale: number,
    origin: THREE.Vector3,
    interpolated: boolean
  ): THREE.Object3D {
    const track = new THREE.Object3D();
    track.name = gpxStatistics.title;
    const track3dChildren = new THREE.Object3D();
    const colors: number[] = gpxStatistics.colors;
    const i = interpolated ? 0.1 : 0;
    const r = colors[0] / 255;
    const g = colors[1] / 255 + i;
    const b = colors[2] / 255;

    const materialTrackSeg = new THREE.LineBasicMaterial({
      color: new THREE.Color(r, g, b),
      transparent: true,
      opacity: interpolated ? 0.5 : 1
    });
    const meshes: THREE.Mesh[] = [];
    const points: THREE.Vector3[] = [];
    const deltaXOrigin = gpxStatistics.trkPoints[0].x - origin.x;
    const deltaYOrigin = gpxStatistics.trkPoints[0].y - origin.y;
    const deltaZOrigin = gpxStatistics.trkPoints[0].altitude - origin.z;

    gpxStatistics.trkPoints.forEach((tkpt: TrackPoint) => {
      points.push(
        new THREE.Vector3(
          deltaXOrigin + tkpt.deltaX0,
          deltaYOrigin + tkpt.deltaY0,
          deltaZOrigin + tkpt.deltaZ0 * zScale
        )
      );
      const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      geometry.translate(
        deltaXOrigin + tkpt.deltaX0,
        deltaYOrigin + tkpt.deltaY0,
        deltaZOrigin + tkpt.deltaZ0 * zScale
      );
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color(r, g, b)
      });
      meshes.push(new THREE.Mesh(geometry, material));
    });

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    track3dChildren.add(new THREE.Line(geometry, materialTrackSeg));
    track3dChildren.add(...meshes);
    track.add(track3dChildren);
    track.userData['stats'] = gpxStatistics;
    return track;
  }
}
