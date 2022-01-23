import { AxesHelper, Vector3 } from 'three';

export interface TargetModel {
  axesHelper: AxesHelper;
  ratio: number;
  targetOnClick: Vector3;
  cameraOnClick: Vector3;
  stepper: number;
}
