import * as THREE from "three";
import Experience from "../Experience";
import earthVertexShader from "../../shaders/earth/vertex.glsl";
import earthFragmentShader from "../../shaders/earth/fragment.glsl";
import atmosphereVertexShader from "../../shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "../../shaders/atmosphere/fragment.glsl";

export default class Earth {
  atmosphereDayColor = "#00aaff";
  atmosphereTwilightColor = "#ff6600";
  cloudsIntencity = 0.5;

  constructor() {
    this.spherical = new THREE.Spherical(20, Math.PI * 0.5, Math.PI * 0.5);
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.navigation = this.experience.navigation;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;
    this.sunPosition = this.experience.world.sun.mesh.position;

    // Debug
    if (this.debug.active) {
      this.setDebug();
    }
    this.setGeometry();
    this.setTextures();
    this.setMaterial();
    this.setMesh();
  }

  setGeometry() {
    this.geometry = new THREE.SphereGeometry(2, 64, 64);
  }

  setTextures() {
    this.resource = this.resources.items.foxModel;
    this.earthDayTexture = this.resources.items.earthDay;
    this.earthDayTexture.colorSpace = THREE.SRGBColorSpace;
    this.earthDayTexture.anisotropy = 8;
    this.earthNightTexture = this.resources.items.earthNight;
    this.earthNightTexture.colorSpace = THREE.SRGBColorSpace;
    this.earthNightTexture.anisotropy = 8;
    this.earthSpecularCloudsTexture = this.resources.items.earthSpecularClouds;
    this.earthSpecularCloudsTexture.anisotropy = 8;
  }

  setMaterial() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: earthVertexShader,
      fragmentShader: earthFragmentShader,
      uniforms: {
        uDayTexture: new THREE.Uniform(this.earthDayTexture),
        uNightTexture: new THREE.Uniform(this.earthNightTexture),
        uSpecularCloudsTexture: new THREE.Uniform(
          this.earthSpecularCloudsTexture,
        ),
        uSunPosition: new THREE.Uniform(this.sunPosition),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereDayColor),
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereTwilightColor),
        ),
        uCloudsIntencity: new THREE.Uniform(this.cloudsIntencity),
      },
    });

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uSunPosition: new THREE.Uniform(this.sunPosition),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereDayColor),
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(this.atmosphereTwilightColor),
        ),
      },
      side: THREE.BackSide,
      transparent: true,
    });
  }

  setMesh() {
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.atmosphereMesh = new THREE.Mesh(
      this.geometry,
      this.atmosphereMaterial,
    );
    this.atmosphereMesh.scale.set(1.04, 1.04, 1.04);
    this.mesh.position.setFromSpherical(this.spherical);
    this.atmosphereMesh.position.setFromSpherical(this.spherical);
    this.scene.add(this.mesh).add(this.atmosphereMesh);
  }

  update() {
    this.mesh.rotation.y = this.time.elapsed * 0.0001;
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Earth");
    this.debugFolder.addColor(this, "atmosphereDayColor").onChange(() => {
      this.material.uniforms.uAtmosphereDayColor.value.set(
        this.atmosphereDayColor,
      );
      this.atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
        this.atmosphereDayColor,
      );
    });
    this.debugFolder.addColor(this, "atmosphereTwilightColor").onChange(() => {
      this.material.uniforms.uAtmosphereTwilightColor.value.set(
        this.atmosphereTwilightColor,
      );
      this.atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
        this.atmosphereTwilightColor,
      );
    });
    this.debugFolder
      .add(this, "cloudsIntencity")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uCloudsIntencity.value = this.cloudsIntencity;
      });
    this.debugFolder
      .add(this.spherical, "phi")
      .min(0)
      .max(Math.PI)
      .step(0.001)
      .onChange(() => this.updatePosition());
    this.debugFolder
      .add(this.spherical, "theta")
      .min(-Math.PI)
      .max(Math.PI)
      .step(0.001)
      .onChange(() => this.updatePosition());
    this.debugFolder.add(this, "navigateTo").name("Navigate to Earth");
  }

  updatePosition() {
    this.mesh.position.setFromSpherical(this.spherical);
    this.atmosphereMesh.position.setFromSpherical(this.spherical);
  }

  navigateTo() {
    this.navigation.navigateTo(this.mesh, { x: 0, y: 0, z: 10 });
  }
}
