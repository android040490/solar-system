import * as THREE from "three";
import gsap from "gsap";
import Experience from "../Experience";
import { OrbitControls } from "three/examples/jsm/Addons.js";
import { ViewableObject } from "../../models/navigation";

export default class Navigator {
  private readonly experience: Experience;
  private readonly camera: THREE.PerspectiveCamera;
  private readonly controls: OrbitControls;
  private currentCameraDirection: THREE.Vector3;

  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;
    this.controls = this.experience.camera.controls;

    this.currentCameraDirection = this.camera.getWorldDirection(
      new THREE.Vector3(),
    );
  }

  navigateTo(spaceObject: ViewableObject): void {
    const { position, pointOfView } = spaceObject;
    const tl = gsap.timeline();
    const newCameraDirection = position.clone();
    const newCameraPosition = newCameraDirection
      .clone()
      .add(new THREE.Vector3(pointOfView.x, pointOfView.y, pointOfView.z));

    tl.to(this.camera.position, {
      x: newCameraPosition.x,
      y: newCameraPosition.y,
      z: newCameraPosition.z,
      duration: 2,
      onUpdate: () => {
        const alpha = tl.progress();
        const vectorToLookAt = new THREE.Vector3().lerpVectors(
          this.currentCameraDirection,
          newCameraDirection,
          alpha,
        );
        this.controls.target = vectorToLookAt;
      },
      onComplete: () => {
        this.currentCameraDirection = newCameraDirection;
      },
    });
  }
}
