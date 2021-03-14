import { Subject } from 'rxjs';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

export interface TrackballControlsModel {
  controls: TrackballControls;
  enabled: boolean;
  eventControls: string;
  target$: Subject<THREE.Vector3>;
}
