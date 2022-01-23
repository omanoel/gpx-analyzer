import { Injectable, SimpleChanges } from '@angular/core';
import { Vector3, PerspectiveCamera } from 'three';
import { MainComponentModel } from '../../@main/main.component.model';

@Injectable({
  providedIn: 'root'
})
export class PerspectiveCameraService {
  private static readonly EPSILON = 0.01;
  private static readonly VIEW_ANGLE = 25;
  private static readonly NEAR = 0.01;
  private static readonly FAR = 1e12;
  private static readonly DEFAULT_ASPECT = 1;

  public previousPositionOfCamera: Vector3 = new Vector3(0, 0, 0);
  public alreadyChecked = false;

  constructor() {
    // Empty
  }

  public initialize(
    width: number,
    height: number,
    coord: number
  ): PerspectiveCamera {
    const camera = new PerspectiveCamera(
      PerspectiveCameraService.VIEW_ANGLE,
      PerspectiveCameraService.DEFAULT_ASPECT,
      PerspectiveCameraService.NEAR,
      PerspectiveCameraService.FAR
    );
    camera.translateX(coord);
    camera.translateY(coord);
    camera.translateZ(coord);
    camera.up = new Vector3(0, 0, 1);
    this._updateAspect(camera, width, height);
    return camera;
  }

  public updateCamera(
    camera: PerspectiveCamera,
    width: number,
    height: number
  ): void {
    this._updateAspect(camera, width, height);
  }

  public onChanges(camera: PerspectiveCamera, changes: SimpleChanges): void {
    const widthChng = changes.width && changes.width.currentValue;
    const heightChng = changes.height && changes.height.currentValue;

    if (widthChng || heightChng) {
      this._updateAspect(camera, widthChng, heightChng);
    }
  }

  public isMoving(model: MainComponentModel): boolean {
    if (model.camera) {
      if (
        this.previousPositionOfCamera.distanceTo(model.camera.position) <
        PerspectiveCameraService.EPSILON * (model.scale > 1 ? 10 : 1)
      ) {
        if (!this.alreadyChecked) {
          this.alreadyChecked = true;
          return false;
        } else {
          return true;
        }
      } else {
        this.alreadyChecked = false;
      }
      this.previousPositionOfCamera.copy(model.camera.position);
      return true;
    } else {
      this.alreadyChecked = false;
      return false;
    }
  }

  private _updateAspect(
    camera: PerspectiveCamera,
    width: number,
    height: number
  ) {
    if (camera) {
      camera.aspect = this._getAspect(width, height);
      camera.updateProjectionMatrix();
    }
  }

  private _getAspect(width: number, height: number): number {
    if (height === 0) {
      return PerspectiveCameraService.DEFAULT_ASPECT;
    }
    return width / height;
  }
}
