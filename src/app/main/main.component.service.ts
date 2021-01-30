import * as THREE from 'three';

import { ElementRef, Injectable, NgZone, SimpleChanges } from '@angular/core';

import { PerspectiveCameraService } from './perspective-camera/perspective-camera.service';
import { RaycasterService } from './raycaster/raycaster.service';
import { SceneService } from './scene/scene.service';
import { TrackballControlsService } from './trackball-controls/trackball-controls.service';
import { MainComponentModel } from './main.component.model';

@Injectable({
  providedIn: 'root'
})
export class MainComponentService {
  constructor(
    private _ngZone: NgZone,
    private _perspectiveCameraService: PerspectiveCameraService,
    private _trackballControlsService: TrackballControlsService,
    private _raycasterService: RaycasterService,
    private _sceneService: SceneService
  ) {}

  public initModel(element: ElementRef): MainComponentModel {
    return {
      renderer: new THREE.WebGLRenderer({
        antialias: true
      }),
      frameId: null,
      element: element,
      camera: null,
      scene: null,
      trackballControls: null,
      raycaster: null,
      mouse: new THREE.Vector2(),
      myObjectOver: null,
      currentIntersected: null,
      lastObjectIntersected: null,
      height: null,
      width: null,
      average: '',
      showSearch: false,
      filters: new Map<string, number[]>(),
      errorMessage: null,
      scale: 1,
      near: 20,
      indexOfCurrent: 0,
      dateMax: 10000,
      dateCurrent: 2000,
      showProperMotion: false,
      changeOnShowProperMotion: false
    };
  }

  public initComponent(mainComponentModel: MainComponentModel): void {
    //
    mainComponentModel.camera = this._perspectiveCameraService.initialize(
      mainComponentModel.width,
      mainComponentModel.height
    );
    //
    mainComponentModel.scene = this._sceneService.initialize();
    //
    mainComponentModel.trackballControls = this._trackballControlsService.initialize();
    //
    mainComponentModel.raycaster = this._raycasterService.initialize();
    //
    mainComponentModel.renderer.setSize(
      mainComponentModel.width,
      mainComponentModel.height
    );
    mainComponentModel.element.nativeElement
      .querySelector('div.map')
      .appendChild(mainComponentModel.renderer.domElement);
    mainComponentModel.renderer.setPixelRatio(
      Math.floor(window.devicePixelRatio)
    );

    mainComponentModel.trackballControls = this._trackballControlsService.initialize();
    this._trackballControlsService.setupControls(mainComponentModel);

    mainComponentModel.camera.position.y = 1;
    mainComponentModel.camera.position.z = 1;
    //this.fog =  new THREE.FogExp2( 0xffffff, 0.015 );
    mainComponentModel.scene.add(mainComponentModel.camera);
  }

  public resetWidthHeight(
    mainComponentModel: MainComponentModel,
    width: number,
    height: number
  ): void {
    mainComponentModel.width = width;
    mainComponentModel.height = height;
    mainComponentModel.renderer.setSize(
      mainComponentModel.width,
      mainComponentModel.height
    );
    this._perspectiveCameraService.updateCamera(
      mainComponentModel.camera,
      mainComponentModel.width,
      mainComponentModel.height
    );
  }

  public gotoTarget(mainComponentModel: MainComponentModel): void {
    if (mainComponentModel.currentIntersected !== null) {
      // this._targetService.setObjectsOnClick(
      //   mainComponentModel,
      //   mainComponentModel.currentIntersected.parent.position
      // );
    }
  }

  public onChanges(
    threeComponentModel: MainComponentModel,
    changes: SimpleChanges
  ): void {
    //
    const widthChange = changes.width && changes.width.currentValue;
    const heightChange = changes.height && changes.height.currentValue;
    if (widthChange || heightChange) {
      threeComponentModel.renderer.setSize(
        threeComponentModel.width,
        threeComponentModel.height
      );
      this._perspectiveCameraService.updateCamera(
        threeComponentModel.camera,
        threeComponentModel.width,
        threeComponentModel.height
      );
    }
  }

  private _animate(threeComponentModel: MainComponentModel): void {
    /*
    requestAnimationFrame(() => this.animate(threeComponentModel));
    this.render(threeComponentModel);
    */
    this._ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this._render(threeComponentModel);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this._render(threeComponentModel);
        });
      }
    });
  }

  private _render(threeComponentModel: MainComponentModel): void {
    threeComponentModel.frameId = requestAnimationFrame(() => {
      this._render(threeComponentModel);
    });
    //
    this._trackballControlsService.updateControls(
      threeComponentModel.trackballControls
    );
    //
    if (
      !this._perspectiveCameraService.isMoving(threeComponentModel) ||
      threeComponentModel.changeOnShowProperMotion
    ) {
      threeComponentModel.changeOnShowProperMotion = false;
    }
    // this._objectsService.updateMovementObjects(threeComponentModel);
    if (!threeComponentModel.showProperMotion) {
      threeComponentModel.dateCurrent = 2000;
    }
    //
    this._findIntersection(threeComponentModel);
    //
    //
    threeComponentModel.renderer.render(
      threeComponentModel.scene,
      threeComponentModel.camera
    );
  }

  private _findIntersection(threeComponentModel: MainComponentModel): void {
    threeComponentModel.raycaster.setFromCamera(
      threeComponentModel.mouse,
      threeComponentModel.camera
    );
  }

  private _afterInitCatalog(threeComponentModel: MainComponentModel): void {
    this._animate(threeComponentModel);
  }
}
