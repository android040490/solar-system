import * as THREE from "three";
import gsap from "gsap";
import Experience from "./Experience";
import { OrbitControls } from "three/addons/Addons.js";
import Sizes from "./Utils/Sizes";

interface FollowedObject {
  position: THREE.Vector3;
  radius: number;
}

export default class Camera {
  private readonly experience: Experience;
  private readonly sizes: Sizes;
  private readonly scene: THREE.Scene;
  private readonly canvas: HTMLCanvasElement;
  private controls!: OrbitControls;
  private _followedObject: FollowedObject | null = null;
  private isTransitioning = false;

  instance!: THREE.PerspectiveCamera;

  constructor() {
    this.experience = new Experience();

    this.sizes = this.experience.sizes;
    this.scene = this.experience.scene;
    this.canvas = this.experience.canvas;

    this.setInstance();
    this.setControls();
  }

  resize(): void {
    this.instance.aspect = this.sizes.width / this.sizes.height;
    this.instance.updateProjectionMatrix();
  }

  update(): void {
    if (this._followedObject) {
      this.controls.target = this._followedObject.position;
    }
    this.controls.update();
  }

  dispose(): void {
    this.controls.dispose();
  }

  followObject(object: FollowedObject): void {
    if (this.isTransitioning) {
      return;
    }
    this.isTransitioning = true;
    this.followedObject = null;
    this.controls.enabled = false;
    const tl = gsap.timeline();

    const initialCameraPosition = this.instance.position.clone();

    const alpha = { value: 0 };
    tl.to(alpha, {
      value: 1,
      ease: "power4.inOut",
      duration: 3,
      onUpdate: () => {
        this.transitionCameraPosition(
          initialCameraPosition,
          object,
          alpha.value,
        );
      },
      onComplete: () => {
        this.followedObject = object;
        this.isTransitioning = false;
        this.controls.enabled = true;
      },
    });
  }

  private setInstance(): void {
    this.instance = new THREE.PerspectiveCamera(
      50,
      this.sizes.width / this.sizes.height,
      0.1,
      100000,
    );

    this.instance.position.set(0, 0, 200);
    this.instance.lookAt(0, 0, 0);
    this.scene.add(this.instance);
  }

  private setControls(): void {
    this.controls = new OrbitControls(this.instance, this.canvas);
    this.controls.enableDamping = true;
  }

  private set followedObject(value: FollowedObject | null) {
    this._followedObject = value;
    if (value) {
      const distance = this.instance.position.distanceTo(this.controls.target);
      this.controls.maxDistance = distance * 10;
      this.controls.minDistance = value.radius + 1;
    } else {
      this.controls.maxDistance = 100000;
      this.controls.minDistance = 1;
    }
  }

  private transitionCameraPosition(
    initialCameraPosition: THREE.Vector3,
    object: FollowedObject,
    alpha: number,
  ): void {
    const { position, radius } = object;
    const newCameraPosition = new THREE.Vector3().lerpVectors(
      initialCameraPosition,
      position.clone().add(new THREE.Vector3(0, 0, radius * 5)),
      alpha,
    );
    this.instance.position.copy(newCameraPosition);
    const vectorToLookAt = new THREE.Vector3().lerpVectors(
      this.controls.target,
      position,
      alpha,
    );
    this.controls.target = vectorToLookAt;

    // this.controls.maxDistance = this.instance.position.distanceTo(
    //   this.controls.target,
    // );
  }
}
