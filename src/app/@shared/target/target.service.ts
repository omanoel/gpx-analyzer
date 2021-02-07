import * as THREE from 'three';

import { Injectable } from '@angular/core';

import { TargetModel } from './target.model';
import { MainComponentModel } from '../../@main/main.component.model';

@Injectable({
  providedIn: 'root'
})
export class TargetService {
  private static readonly SCALE = 0.2;
  private static readonly EPSILON = 0.01;
  private static readonly STEP = 20;

  constructor() {
    // Empty
  }

  public initialize(): TargetModel {
    return {
      axesHelper: new THREE.AxesHelper(TargetService.SCALE),
      ratio: 1,
      targetOnClick: null,
      cameraOnClick: null,
      stepper: TargetService.STEP
    };
  }

  public create(
    target: TargetModel,
    myScene: THREE.Scene,
    myPoint: THREE.Vector3
  ): void {
    target.axesHelper.translateX(myPoint.x);
    target.axesHelper.translateY(myPoint.y);
    target.axesHelper.translateZ(myPoint.z);
    myScene.add(target.axesHelper);
  }

  public updateAxesHelper(
    target: TargetModel,
    myNewPoint: THREE.Vector3,
    camera: THREE.Camera
  ): void {
    if (!target.ratio) {
      target.ratio = camera.position.distanceTo(myNewPoint);
    }
    const oldPosition = new THREE.Vector3().copy(target.axesHelper.position);
    target.axesHelper.translateX(myNewPoint.x - oldPosition.x);
    target.axesHelper.translateY(myNewPoint.y - oldPosition.y);
    target.axesHelper.translateZ(myNewPoint.z - oldPosition.z);
    const dist = camera.position.distanceTo(myNewPoint);
    const newScale = (TargetService.SCALE * dist) / target.ratio;
    target.axesHelper.scale.set(newScale, newScale, newScale);
  }

  public setObjectsOnClick(
    mainComponentModel: MainComponentModel,
    myClickPoint: THREE.Vector3
  ): void {
    this._setStepper(mainComponentModel, myClickPoint);
    mainComponentModel.target.targetOnClick = myClickPoint;
    const dist = myClickPoint.distanceTo(new THREE.Vector3(0, 0, 0));
    if (dist < 1) {
      mainComponentModel.target.cameraOnClick = new THREE.Vector3(1, 1, 1);
    } else {
      const ratio = (dist + 1) / dist;
      mainComponentModel.target.cameraOnClick = myClickPoint
        .clone()
        .multiplyScalar(ratio);
    }
  }

  public refreshObjectsOnClick(mainComponentModel: MainComponentModel): void {
    const gap = mainComponentModel.scale > 1 ? 10 : 1;
    if (mainComponentModel.target.targetOnClick) {
      if (
        mainComponentModel.target.targetOnClick.distanceTo(
          mainComponentModel.trackballControls.controls.target
        ) >
        TargetService.EPSILON * gap
      ) {
        this._getNewPosition(mainComponentModel);
      } else {
        mainComponentModel.trackballControls.controls.target.copy(
          mainComponentModel.target.targetOnClick
        );
        mainComponentModel.trackballControls.target$.next(
          mainComponentModel.trackballControls.controls.target
        );
        mainComponentModel.camera.position.copy(
          mainComponentModel.target.cameraOnClick
        );
        mainComponentModel.camera.up = new THREE.Vector3(0, 0, 1);
        mainComponentModel.target.targetOnClick = null;
      }
    }
  }

  private _setStepper(
    mainComponentModel: MainComponentModel,
    myClickPoint: THREE.Vector3
  ): void {
    let step = mainComponentModel.trackballControls.controls.target
      .clone()
      .distanceTo(myClickPoint);
    if (step > TargetService.STEP) {
      step = TargetService.STEP;
    }
    mainComponentModel.target.stepper = 5 + Math.floor(step);
  }

  private _getNewPosition(mainComponentModel: MainComponentModel): void {
    // displacement for target
    const displacementForTarget = new THREE.Vector3().subVectors(
      mainComponentModel.target.targetOnClick,
      mainComponentModel.trackballControls.controls.target
    );
    const newPositionForTarget = mainComponentModel.trackballControls.controls.target
      .clone()
      .add(
        displacementForTarget.divideScalar(mainComponentModel.target.stepper)
      );
    mainComponentModel.trackballControls.controls.target.copy(
      newPositionForTarget
    );
    mainComponentModel.trackballControls.target$.next(
      mainComponentModel.trackballControls.controls.target
    );
    // displacement for camera
    const displacementForCamera = new THREE.Vector3().subVectors(
      mainComponentModel.target.cameraOnClick,
      mainComponentModel.camera.position
    );
    const newPositionForCamera = mainComponentModel.camera.position
      .clone()
      .add(
        displacementForCamera.divideScalar(mainComponentModel.target.stepper)
      );
    mainComponentModel.camera.position.copy(newPositionForCamera);
    // rotation for camera
    const upForCamera = new THREE.Vector3().subVectors(
      new THREE.Vector3(0, 0, 1),
      mainComponentModel.camera.up
    );
    const newUpForCamera = mainComponentModel.camera.up
      .clone()
      .add(upForCamera.divideScalar(mainComponentModel.target.stepper));
    mainComponentModel.camera.up.copy(newUpForCamera);
  }
}
