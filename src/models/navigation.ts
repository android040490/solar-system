import * as THREE from "three";

export interface PointOfView {
  x: number;
  y: number;
  z: number;
}

export interface ViewableObject {
  pointOfView: PointOfView;
  position: THREE.Vector3;
}
