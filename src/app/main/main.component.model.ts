import * as THREE from 'three';

import { ElementRef } from '@angular/core';

import { TrackballControlsModel } from './trackball-controls/trackball-controls.model';
import { ReferentielModel } from './referentiel/referentiel.model';
import { TargetModel } from './target/target.model';

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
  tracks: THREE.Object3D[];
  target: TargetModel;
  countObjects: number;
  zScale: number;
  needsUpdate: boolean;
}

export interface ObjectOver {
  objectIntersected: THREE.Object3D;
  objectDisplay: THREE.Object3D;
}
