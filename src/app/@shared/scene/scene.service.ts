import * as THREE from 'three';

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  constructor() {
    // Empty
  }

  public initialize(): THREE.Scene {
    return new THREE.Scene();
  }

  public getTack3ds(scene: THREE.Scene): THREE.Object3D[] {
    return scene.children.filter((obj) => obj.userData['stats']);
  }
}
