import * as THREE from "three";
import Experience from "../Experience";

export default class Environment {
  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.recources = this.experience.resources;
    this.debug = this.experience.debug;

    if (this.debug.active) {
      this.debugFolder = this.debug.ui.addFolder("environment");
    }

    this.setSunLight();
    this.setEnvironmentMap();
  }

  setSunLight() {
    // point light
    this.sunLight = new THREE.PointLight("#ffffff", 5, 1000, 0);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.camera.far = 15;
    this.sunLight.shadow.mapSize.set(1024, 1024);
    this.sunLight.shadow.normalBias = 0.05;
    this.sunLight.position.set(0.0, 0.0, 0.0);
    this.scene.add(this.sunLight);
    // ambient light
    this.ambientLight = new THREE.AmbientLight("#ffffff", 0.05);
    this.scene.add(this.ambientLight);

    if (this.debug.active) {
      this.setDebug();
    }
  }

  setDebug() {
    this.debugFolder
      .add(this.sunLight, "intensity")
      .min(0)
      .max(10)
      .step(0.001)
      .name("sunLightIntensity");
    this.debugFolder
      .add(this.sunLight.position, "y")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightY");
    this.debugFolder
      .add(this.sunLight.position, "z")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightZ");
    this.debugFolder
      .add(this.sunLight.position, "x")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightX");
  }

  setEnvironmentMap() {
    this.texture = this.recources.textures.get("environmentMap");
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.mapping = THREE.EquirectangularReflectionMapping;
    this.scene.background = this.texture;
  }
}
