import * as THREE from "three";
import Experience from "../Experience";
import earthVertexShader from "../../shaders/earth/vertex.glsl";
import earthFragmentShader from "../../shaders/earth/fragment.glsl";
import atmosphereVertexShader from "../../shaders/atmosphere/vertex.glsl";
import atmosphereFragmentShader from "../../shaders/atmosphere/fragment.glsl";

export default class Earth {
  earthParameters = {
    atmosphereDayColor: "#00aaff",
    atmosphereTwilightColor: "#ff6600",
    cloudsIntencity: 0.5,
  };

  constructor() {
    this.experience = new Experience();
    this.scene = this.experience.scene;
    this.resources = this.experience.resources;
    this.time = this.experience.time;
    this.debug = this.experience.debug;

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
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(this.earthParameters.atmosphereDayColor),
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(this.earthParameters.atmosphereTwilightColor),
        ),
        uCloudsIntencity: new THREE.Uniform(
          this.earthParameters.cloudsIntencity,
        ),
      },
    });

    this.atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: atmosphereVertexShader,
      fragmentShader: atmosphereFragmentShader,
      uniforms: {
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
        uAtmosphereDayColor: new THREE.Uniform(
          new THREE.Color(this.earthParameters.atmosphereDayColor),
        ),
        uAtmosphereTwilightColor: new THREE.Uniform(
          new THREE.Color(this.earthParameters.atmosphereTwilightColor),
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
    this.scene.add(this.mesh).add(this.atmosphereMesh);
  }

  update() {
    this.mesh.rotation.y = this.time.elapsed * 0.00001;
  }

  setDebug() {
    this.debugFolder = this.debug.ui.addFolder("Earth");
    this.debugFolder
      .addColor(this.earthParameters, "atmosphereDayColor")
      .onChange(() => {
        this.material.uniforms.uAtmosphereDayColor.value.set(
          this.earthParameters.atmosphereDayColor,
        );
        this.atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
          this.earthParameters.atmosphereDayColor,
        );
      });
    this.debugFolder
      .addColor(this.earthParameters, "atmosphereTwilightColor")
      .onChange(() => {
        this.material.uniforms.uAtmosphereTwilightColor.value.set(
          this.earthParameters.atmosphereTwilightColor,
        );
        this.atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
          this.earthParameters.atmosphereTwilightColor,
        );
      });
    this.debugFolder
      .add(this.earthParameters, "cloudsIntencity")
      .min(0)
      .max(1)
      .step(0.01)
      .onChange(() => {
        this.material.uniforms.uCloudsIntencity.value =
          this.earthParameters.cloudsIntencity;
      });
  }
}
