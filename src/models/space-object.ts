import * as THREE from "three";
import { NavigableObject } from "./navigation";
import Experience from "../Experience/Experience";
import Resources from "../Experience/Utils/Resources";
import Time from "../Experience/Utils/Time";
import Debug from "../Experience/Utils/Debug";

export interface SpaceObjectOptions {
  radius: number;
  name: string;
  markerColor?: string;
}

export default abstract class SpaceObject implements NavigableObject {
  protected abstract setGeometry(): void;
  protected abstract setTexture(): void;
  protected abstract setMaterial(): void;
  protected abstract setMesh(): void;

  protected readonly experience: Experience;
  protected readonly scene: THREE.Scene;
  protected readonly resources: Resources;
  protected readonly time: Time;
  protected readonly debug: Debug;

  public readonly name: string;
  public readonly radius: number;
  public readonly markerColor?: string;
  public abstract position: THREE.Vector3;

  public abstract update(): void;

  constructor(options: SpaceObjectOptions) {
    const { radius, name, markerColor } = options;
    this.radius = radius;
    this.name = name;
    this.markerColor = markerColor;

    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
  }

  protected init(): void {
    this.setGeometry();
    this.setTexture();
    this.setMaterial();
    this.setMesh();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  protected setDebug(): void {}
}
