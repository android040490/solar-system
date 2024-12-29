import * as THREE from "three";
import Experience from "../Experience";

export default class Planet {
  constructor(options) {
    const { name, radius, texture, distanceToSun, cameraOffset } = options;
    this.name = name;
    this.radius = radius;
    this.texture = texture;
    this.distanceToSun = distanceToSun;
    this.cameraOffset = cameraOffset;

    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.navigation = this.experience.navigation;
    this.resources = this.experience.resources;
    this.time = this.experience.time;

    this.setGeometry();
    this.configureTexture();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(this.radius, 64, 64);
  }

  configureTexture() {
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 8;
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      map: this.texture,
    });
  }

  setMesh() {
    this.spherical = new THREE.Spherical(
      this.distanceToSun,
      Math.PI * 0.5,
      Math.PI * 0.5,
    );
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.setFromSpherical(this.spherical);
    this.scene.add(this.mesh);
  }

  update() {
    this.mesh.rotation.y = this.time.elapsed * 0.0001;
  }

  navigateTo() {
    this.navigation.navigateTo(this.mesh, this.cameraOffset);
  }
}
