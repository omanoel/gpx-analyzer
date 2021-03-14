import * as THREE from 'three';

import { Injectable } from '@angular/core';

import { ReferentielModel } from './referentiel.model';

@Injectable({
  providedIn: 'root'
})
export class ReferentielService {
  private static readonly COUNT = 20;
  private static readonly FACTOR = 4;
  private _init = false;

  constructor() {
    // Empty
  }

  public initialize(camera: THREE.PerspectiveCamera): ReferentielModel {
    const color = 0xffffff;
    const distance = 1000; // camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    const referentiel3d = new THREE.Object3D();
    referentiel3d.add(
      ...this._buildObjects(color, distance, new THREE.Vector3(0, 0, 0))
    );
    return {
      origin: new THREE.Vector3(0, 0, 0),
      distReference: distance,
      objects: referentiel3d
    };
  }

  public update(
    referentiel: ReferentielModel,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    center: THREE.Vector3
  ): void {
    // const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
    if (!this._init) {
      this._init = true;
      this._updateObjects(referentiel, scene);
    } else if (center.distanceTo(referentiel.origin) > 1) {
      referentiel.origin.copy(center);
      this._updateObjects(referentiel, scene);
    }
    /*
    if (dist > referentiel.distReference * (ReferentielService.FACTOR - 1)) {
      referentiel.distReference = dist;
      this._updateObjects(referentiel, scene);
    } else if (dist < referentiel.distReference) {
      referentiel.distReference = dist / (ReferentielService.FACTOR - 1);
      this._updateObjects(referentiel, scene);
    }
    */
  }

  private _updateObjects(
    referentiel: ReferentielModel,
    scene: THREE.Scene
  ): void {
    scene.remove(referentiel.objects);
    const color = 0xffffff;
    referentiel.objects.children.length = 0;
    referentiel.objects.add(
      ...this._buildObjects(
        color,
        referentiel.distReference,
        referentiel.origin
      )
    );
    scene.add(referentiel.objects);
  }

  private _buildObjects(
    color: number,
    distance: number,
    origin: THREE.Vector3
  ): THREE.Line[] {
    return this._buildLinesXY(color, distance, origin);
  }

  private _buildLinesXY(
    color: number,
    distance: number,
    origin: THREE.Vector3
  ): THREE.Line[] {
    const materialMajor = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.2
    });
    const materialMinor = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.1
    });
    const lines: THREE.Line[] = [];
    for (let i = -10; i < 11; i++) {
      const material = i % 10 === 0 ? materialMajor : materialMinor;
      lines.push(this._buildLine(material, i, 1, 0, distance, origin));
      lines.push(this._buildLine(material, i, 0, 1, distance, origin));
    }
    return lines;
  }

  private _buildLine(
    material: THREE.LineBasicMaterial,
    index: number,
    axisX: number,
    axisY: number,
    distance: number,
    origin: THREE.Vector3
  ): THREE.Line {
    const geometryX = new THREE.BufferGeometry();
    const positions = new Float32Array(2 * 3); // 3 vertices per point
    positions[0] = origin.x + distance * index * axisX - distance * axisY * 10;
    positions[1] = origin.y + distance * index * axisY - distance * axisX * 10;
    positions[2] = origin.z;
    positions[3] = origin.x + distance * index * axisX + distance * axisY * 10;
    positions[4] = origin.y + distance * index * axisY + distance * axisX * 10;
    positions[5] = origin.z;
    geometryX.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return new THREE.Line(geometryX, material);
  }
}
