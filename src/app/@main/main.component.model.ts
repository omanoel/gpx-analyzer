import { ElementRef } from '@angular/core';

import { TrackballControlsModel } from '../@shared/trackball-controls/trackball-controls.model';
import { ReferentielModel } from '../@shared/referentiel/referentiel.model';
import { TargetModel } from '../@shared/target/target.model';
import { GpxFile } from '../@shared/gpx-file/gpx-file.model';
import { MenuModel } from '../menu/menu.model';
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Raycaster,
  Vector2,
  Object3D,
  Vector3
} from 'three';

export interface MainComponentModel {
  element: ElementRef;
  renderer: WebGLRenderer;
  frameId: number;
  scene: Scene;
  camera: PerspectiveCamera;
  referentiel: ReferentielModel;
  trackballControls: TrackballControlsModel;
  raycaster: Raycaster;
  mouse: Vector2;
  myObjectOver: ObjectOver;
  currentIntersected: Object3D;
  lastObjectIntersected: Object3D;
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
  track3ds: Object3D[];
  target: TargetModel;
  countObjects: number;
  zScale: number;
  interpolationStepFc: number;
  needsUpdate: boolean;
  needsRemove: boolean;
  gpxFiles: GpxFile[];
  firstPosition: Vector3;
  menu: MenuModel;
}

export interface ObjectOver {
  objectIntersected: Object3D;
  objectDisplay: Object3D;
}
