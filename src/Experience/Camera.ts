import * as THREE from "three";
import Experience from "./Experience";
import { OrbitControls } from "three/addons/Addons.js";
import Sizes from "./Utils/Sizes";

export default class Camera {
  private readonly experience: Experience;
  private readonly sizes: Sizes;
  private readonly scene: THREE.Scene;
  private readonly canvas: HTMLCanvasElement;
  private _controls!: OrbitControls;

  instance!: THREE.PerspectiveCamera;

  constructor() {
    this.experience = new Experience();

    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setControls();
  }

  get controls(): OrbitControls {
    return this._controls;
  }

  resize(): void {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update(): void {
    this._controls.update();
  }

  dispose(): void {
    this._controls.dispose();
  }

  private setInstance(): void {
    this.instance = new THREE.PerspectiveCamera(
      50,
      this.sizes.width / this.sizes.height,
      0.1,
    );

    this.instance.position.set(0, 0, 200);
    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  private setControls(): void {
    this._controls = new OrbitControls(this.instance, this.canvas);
    this._controls.enableDamping = true;
  }
}
