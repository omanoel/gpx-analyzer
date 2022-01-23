import { Injectable } from '@angular/core';
import { Scene, Object3D } from 'three';

@Injectable({
  providedIn: 'root'
})
export class SceneService {
  constructor() {
    // Empty
  }

  public initialize(): Scene {
    return new Scene();
  }

  public getTack3ds(scene: Scene): Object3D[] {
    return scene.children.filter((obj) => obj.userData['stats']);
  }
}
