import * as THREE from "three";
import gsap from "gsap";
import Experience from "../Experience";

export default class Navigator {
  constructor() {
    this.experience = new Experience();
    this.camera = this.experience.camera.instance;
    this.controls = this.experience.camera.controls;

    this.currentCameraDirection = this.camera.getWorldDirection(
      new THREE.Vector3(),
    );
  }

  navigateTo(mesh, offset = { x: 0, y: 0, z: 0 }) {
    const tl = gsap.timeline();
    const newCameraDirection = mesh.position.clone();
    const newCameraPosition = newCameraDirection
      .clone()
      .add(new THREE.Vector3(offset.x, offset.y, offset.z));

    tl.to(this.camera.position, {
      x: newCameraPosition.x,
      y: newCameraPosition.y,
      z: newCameraPosition.z,
      duration: 2,
      onUpdate: () => {
        const vectorToLookAt = new THREE.Vector3().lerpVectors(
          this.currentCameraDirection,
          newCameraDirection,
          tl.progress(),
        );
        this.controls.target = vectorToLookAt;
      },
      onComplete: () => {
        this.currentCameraDirection = newCameraDirection;
      },
    });
  }
}
