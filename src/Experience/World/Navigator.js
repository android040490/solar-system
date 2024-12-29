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

  navigateTo(spaceObject) {
    const { mesh, pointOfView } = spaceObject;
    const tl = gsap.timeline();
    const newCameraDirection = mesh.position.clone();
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
