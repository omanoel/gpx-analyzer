import { Injectable } from '@angular/core';
import { Raycaster } from 'three';

@Injectable({
  providedIn: 'root'
})
export class RaycasterService {
  constructor() {
    // Empty
  }

  public initialize(): Raycaster {
    // TODO: find how to update this parameter
    // this.raycaster.linePrecision = 3;
    return new Raycaster();
  }
}
