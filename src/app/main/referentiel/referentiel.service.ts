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
    return {
      origin: new THREE.Vector3(0, 0, 0),
      distReference: distance,
      objects: this._buildObjects(color, distance, new THREE.Vector3(0, 0, 0))
    };
  }

  public update(
    referentiel: ReferentielModel,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
    center: THREE.Vector3
  ): void {
    const dist = camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
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
    for (const refObject of referentiel.objects) {
      scene.remove(refObject);
    }
    const color = 0xffffff;
    referentiel.objects = this._buildObjects(
      color,
      referentiel.distReference,
      referentiel.origin
    );
    for (const refObject of referentiel.objects) {
      scene.add(refObject);
    }
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
    const geometryX = new THREE.Geometry();
    geometryX.vertices.push(
      new THREE.Vector3(
        origin.x + distance * index * axisX - distance * axisY * 10,
        origin.y + distance * index * axisY - distance * axisX * 10,
        origin.z
      ),
      new THREE.Vector3(
        origin.x + distance * index * axisX + distance * axisY * 10,
        origin.y + distance * index * axisY + distance * axisX * 10,
        origin.z
      )
    );
    return new THREE.Line(geometryX, material);
  }
}
