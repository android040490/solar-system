import * as THREE from "three";
import GUI from "lil-gui";
import Experience from "../Experience";
import Debug from "../Utils/Debug";
import Resources from "../Utils/Resources";

export default class Environment {
  private readonly experience: Experience;
  private readonly scene: THREE.Scene;
  private readonly debug: Debug;
  private readonly resources: Resources;

  private sunLight!: THREE.PointLight;
  private ambientLight!: THREE.AmbientLight;
  private debugFolder?: GUI;
  private texture?: THREE.Texture;

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.debug = this.experience.debug;

    this.setLight();
    this.loadTexture().then(() => {
      this.init();
    });
  }

  private async loadTexture(): Promise<void> {
    this.texture = await this.resources.loadTexture(
      "textures/environment/stars_milky_way_8k.jpg",
    );
  }

  private init(): void {
    this.setEnvironmentMap();

    if (this.debug.active) {
      this.setDebug();
    }
  }

  private setLight(): void {
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
  }

  // TODO: maybe move this to the Sun object
  private setDebug(): void {
    this.debugFolder = this.debug.ui?.addFolder("environment");

    this.debugFolder
      ?.add(this.sunLight, "intensity")
      .min(0)
      .max(10)
      .step(0.001)
      .name("sunLightIntensity");
    this.debugFolder
      ?.add(this.sunLight.position, "y")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightY");
    this.debugFolder
      ?.add(this.sunLight.position, "z")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightZ");
    this.debugFolder
      ?.add(this.sunLight.position, "x")
      .min(-5)
      .max(5)
      .step(0.001)
      .name("sunLightX");
  }

  private setEnvironmentMap(): void {
    if (this.texture) {
      this.texture.colorSpace = THREE.SRGBColorSpace;
      this.texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.background = this.texture;
    }
  }
}
