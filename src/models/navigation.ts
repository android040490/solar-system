import * as THREE from "three";

export interface NavigableObject {
  position: THREE.Vector3;
  radius: number;
  name: string;
  markerColor?: string;
}
