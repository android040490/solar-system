import * as THREE from "three";
import Experience from "../Experience";

export default class Sun {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;

    this.setGeometry();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.IcosahedronGeometry(0.1, 2);
  }

  setMaterial() {
    this.material = new THREE.MeshBasicMaterial();
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(this.mesh);
  }
}
