import * as THREE from "three";
import SpaceObject, { SpaceObjectOptions } from "./space-object";

export interface OrbitalObjectOptions extends SpaceObjectOptions {
  orbitRadius: number;
  orbitSpeed: number;
  offsetAngle: number;
  parentObject: SpaceObject;
}

export default abstract class OrbitalObject extends SpaceObject {
  private _position = new THREE.Vector3();
  private offsetAngle: number;

  protected readonly orbitRadius: number;
  protected readonly orbitSpeed: number;
  protected readonly parentObject: SpaceObject;

  constructor(options: OrbitalObjectOptions) {
    super(options);
    const { orbitRadius, orbitSpeed, parentObject, offsetAngle } = options;
    this.orbitRadius = orbitRadius;
    this.orbitSpeed = orbitSpeed;
    this.parentObject = parentObject;
    this.offsetAngle = offsetAngle;
  }

  get position(): THREE.Vector3 {
    return this._position;
  }

  private calculatePosition(): void {
    const orbitCenter = this.parentObject.position;
    const angle =
      this.time.elapsed * 0.00001 * this.orbitSpeed + this.offsetAngle;
    const position = new THREE.Vector3();
    position.x = orbitCenter.x + Math.cos(angle) * this.orbitRadius;
    position.z = orbitCenter.z + Math.sin(angle) * this.orbitRadius;
    this._position = position;
  }

  public update(): void {
    this.calculatePosition();
  }
}
