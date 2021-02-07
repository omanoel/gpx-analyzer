import { Subject } from 'rxjs';
import * as THREE from 'three';
import { TrackballControls } from 'three-trackballcontrols-ts';

import { Injectable } from '@angular/core';

import { TrackballControlsModel } from './trackball-controls.model';
import { MainComponentModel } from '../../@main/main.component.model';

@Injectable({ providedIn: 'root' })
export class TrackballControlsService {
  constructor() {
    // Empty
  }

  public initialize(): TrackballControlsModel {
    return {
      controls: null,
      enabled: true,
      eventControls: null,
      target$: new Subject<THREE.Vector3>()
    };
  }

  public setupControls(model: MainComponentModel): void {
    model.trackballControls.controls = new TrackballControls(
      model.camera,
      model.renderer.domElement
    );
    model.trackballControls.controls.enabled = model.trackballControls.enabled;
    model.trackballControls.controls.addEventListener('end', () => {
      // this._starsService.updateProximityStars(threeComponentModel);
      model.trackballControls.target$.next(
        model.trackballControls.controls.target
      );
    });
  }

  public updateControls(trackballControls: TrackballControlsModel): void {
    trackballControls.controls.update();
  }
}
