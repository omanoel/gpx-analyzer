import * as THREE from 'three';

import { ElementRef, Injectable, NgZone, SimpleChanges } from '@angular/core';

import { PerspectiveCameraService } from './perspective-camera/perspective-camera.service';
import { RaycasterService } from './raycaster/raycaster.service';
import { SceneService } from './scene/scene.service';
import { TrackballControlsService } from './trackball-controls/trackball-controls.service';
import { MainComponentModel } from './main.component.model';
import { ReferentielService } from './referentiel/referentiel.service';
import { TargetService } from './target/target.service';
import { TrackService } from './track/track.service';

@Injectable({
  providedIn: 'root'
})
export class MainComponentService {
  constructor(
    private _ngZone: NgZone,
    private _perspectiveCameraService: PerspectiveCameraService,
    private _trackballControlsService: TrackballControlsService,
    private _raycasterService: RaycasterService,
    private _sceneService: SceneService,
    private _referentielService: ReferentielService,
    private _targetService: TargetService,
    private _trackService: TrackService
  ) {}

  public initModel(element: ElementRef): MainComponentModel {
    return {
      renderer: new THREE.WebGLRenderer({
        antialias: true
      }),
      frameId: null,
      element: element,
      camera: null,
      referentiel: null,
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
      changeOnShowProperMotion: false,
      track3ds: [],
      target: null,
      countObjects: 0,
      zScale: 1,
      needsUpdate: false,
      gpxFiles: [],
      firstPosition: null,
      menu: {
        isGpxFilesDisplayed: false
      }
    };
  }

  public initComponent(mainComponentModel: MainComponentModel): void {
    //
    mainComponentModel.camera = this._perspectiveCameraService.initialize(
      mainComponentModel.width,
      mainComponentModel.height,
      50000
    );
    //
    mainComponentModel.referentiel = this._referentielService.initialize(
      mainComponentModel.camera
    );
    //
    mainComponentModel.target = this._targetService.initialize();
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

    this._trackballControlsService.setupControls(mainComponentModel);

    mainComponentModel.camera.position.y = 50000;
    mainComponentModel.camera.position.z = 50000;
    //this.fog =  new THREE.FogExp2( 0xffffff, 0.015 );
    mainComponentModel.scene.add(mainComponentModel.camera);
    //
    this._targetService.create(
      mainComponentModel.target,
      mainComponentModel.scene,
      mainComponentModel.trackballControls.controls.target
    );
    this._afterInit(mainComponentModel);
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
    mainComponentModel: MainComponentModel,
    changes: SimpleChanges
  ): void {
    //
    const widthChange = changes.width && changes.width.currentValue;
    const heightChange = changes.height && changes.height.currentValue;
    if (widthChange || heightChange) {
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
  }

  private _animate(mainComponentModel: MainComponentModel): void {
    /*
    requestAnimationFrame(() => this.animate(threeComponentModel));
    this.render(threeComponentModel);
    */
    this._ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this._render(mainComponentModel);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this._render(mainComponentModel);
        });
      }
    });
  }

  private _render(mainComponentModel: MainComponentModel): void {
    mainComponentModel.frameId = requestAnimationFrame(() => {
      this._render(mainComponentModel);
    });
    //
    this._trackballControlsService.updateControls(
      mainComponentModel.trackballControls
    );
    //
    this._referentielService.update(
      mainComponentModel.referentiel,
      mainComponentModel.scene,
      mainComponentModel.camera,
      mainComponentModel.target.axesHelper.position
    );
    //
    this._targetService.updateAxesHelper(
      mainComponentModel.target,
      mainComponentModel.trackballControls.controls.target,
      mainComponentModel.camera
    );
    //
    if (mainComponentModel.needsUpdate) {
      // console.log('firstPosition', mainComponentModel.firstPosition);
      // console.log('camera.position', mainComponentModel.camera.position);
      // console.log('camera.up', mainComponentModel.camera.up);
      this._trackService.build3dTracks(mainComponentModel);
      mainComponentModel.countObjects = this._sceneService.getTack3ds(
        mainComponentModel.scene
      ).length;
      mainComponentModel.needsUpdate = false;
    }
    //
    if (
      !this._perspectiveCameraService.isMoving(mainComponentModel) ||
      mainComponentModel.changeOnShowProperMotion
    ) {
      mainComponentModel.changeOnShowProperMotion = false;
    }
    // this._objectsService.updateMovementObjects(threeComponentModel);
    if (!mainComponentModel.showProperMotion) {
      mainComponentModel.dateCurrent = 2000;
    }
    //
    this._findIntersection(mainComponentModel);
    //
    //
    mainComponentModel.renderer.render(
      mainComponentModel.scene,
      mainComponentModel.camera
    );
  }

  private _findIntersection(mainComponentModel: MainComponentModel): void {
    mainComponentModel.raycaster.setFromCamera(
      mainComponentModel.mouse,
      mainComponentModel.camera
    );
  }

  private _afterInit(mainComponentModel: MainComponentModel): void {
    mainComponentModel.needsUpdate = true;
    this._animate(mainComponentModel);
  }

  private _getOrigin(mainComponentModel: MainComponentModel): THREE.Vector3 {
    const origin = new THREE.Vector3();
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    if (mainComponentModel.gpxFiles.length > 0) {
      mainComponentModel.gpxFiles.forEach((gpxFile) => {
        minX = minX < gpxFile.statistics.xMin ? minX : gpxFile.statistics.xMin;
        minY = minY < gpxFile.statistics.yMin ? minY : gpxFile.statistics.yMin;
        maxX = maxX > gpxFile.statistics.xMax ? maxX : gpxFile.statistics.xMax;
        maxY = maxY > gpxFile.statistics.yMax ? maxY : gpxFile.statistics.yMax;
      });
    } else {
      minX = 0;
      minY = 0;
      maxX = 0;
      maxY = 0;
    }
    origin.setX((maxX - minX) / 2);
    origin.setY((maxY - minY) / 2);
    origin.setZ(0);
    return origin;
  }
}
