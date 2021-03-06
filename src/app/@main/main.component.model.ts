import * as THREE from 'three';

import { ElementRef } from '@angular/core';

import { TrackballControlsModel } from '../@shared/trackball-controls/trackball-controls.model';
import { ReferentielModel } from '../@shared/referentiel/referentiel.model';
import { TargetModel } from '../@shared/target/target.model';
import { GpxFile } from '../@shared/gpx-file/gpx-file.model';
import { MenuModel } from '../menu/menu.model';

export interface MainComponentModel {
  element: ElementRef;
  renderer: THREE.WebGLRenderer;
  frameId: number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  referentiel: ReferentielModel;
  trackballControls: TrackballControlsModel;
  raycaster: THREE.Raycaster;
  mouse: THREE.Vector2;
  myObjectOver: ObjectOver;
  currentIntersected: THREE.Object3D;
  lastObjectIntersected: THREE.Object3D;
  average: string;
  height: number;
  width: number;
  showSearch: boolean;
  filters: Map<string, number[]>;
  errorMessage: string;
  scale: number;
  near: number;
  indexOfCurrent: number;
  dateMax: number;
  dateCurrent: number;
  showProperMotion: boolean;
  changeOnShowProperMotion: boolean;
  track3ds: THREE.Object3D[];
  target: TargetModel;
  countObjects: number;
  zScale: number;
  interpolationStepFc: number;
  needsUpdate: boolean;
  needsRemove: boolean;
  gpxFiles: GpxFile[];
  firstPosition: THREE.Vector3;
  menu: MenuModel;
}

export interface ObjectOver {
  objectIntersected: THREE.Object3D;
  objectDisplay: THREE.Object3D;
}
