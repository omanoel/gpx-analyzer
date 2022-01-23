import { Object3D, Vector3 } from 'three';

export interface ReferentielModel {
  origin: Vector3;
  objects: Object3D;
  distReference: number;
}
